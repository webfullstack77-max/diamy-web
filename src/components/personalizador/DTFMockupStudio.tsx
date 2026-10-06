"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MOCKUP_SCENES,
  PLAYERYTEES_MODELS,
  TShirtColor,
  MockupSceneConfig,
  getMockupSceneImagePath,
} from "@/lib/mockup-data";

interface DesignAsset {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
}

interface DesignCollection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  designs: DesignAsset[];
}

export default function DTFMockupStudio() {
  // Collections state
  const [collections, setCollections] = useState<DesignCollection[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // Scene & Model & Color state
  const [currentScene, setCurrentScene] = useState<MockupSceneConfig>(MOCKUP_SCENES[0]);
  const [currentModelKey, setCurrentModelKey] = useState<'410c' | '410d' | '410n'>('410c');
  const currentModel = PLAYERYTEES_MODELS[currentModelKey];

  // Default color: Black
  const [currentColor, setCurrentColor] = useState<TShirtColor>(
    currentModel.colors.find((c) => c.name_en === "Black") || currentModel.colors[0]
  );

  // Design state
  const [selectedDesign, setSelectedDesign] = useState<{
    id: string;
    title: string;
    imageUrl: string;
    collectionName?: string;
  } | null>(null);

  // Transform controls
  const [designPos, setDesignPos] = useState<{ x: number; y: number }>(MOCKUP_SCENES[0].defaultPos);
  const [designScale, setDesignScale] = useState<number>(1.0);
  const [designRotation, setDesignRotation] = useState<number>(0);
  const [designTilt, setDesignTilt] = useState<number>(MOCKUP_SCENES[0].defaultTilt);
  const [designSkew, setDesignSkew] = useState<number>(0);
  const [designBlendMode, setDesignBlendMode] = useState<GlobalCompositeOperation>("source-over");
  const [showBadge, setShowBadge] = useState<boolean>(true);

  // Image references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mockupContainerRef = useRef<HTMLDivElement | null>(null);
  const backgroundPhotoRef = useRef<HTMLImageElement | null>(null);
  const designImageRef = useRef<HTMLImageElement | null>(null);

  // UI state
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  // Dragging state on canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const customFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Auto smooth scroll to mockup whenever a design is selected (PC & Mobile)
  const scrollToMockup = useCallback(() => {
    if (typeof window === "undefined") return;
    if (mockupContainerRef.current) {
      const rect = mockupContainerRef.current.getBoundingClientRect();
      // If mockup is not positioned right in view (user scrolled down to gallery)
      if (rect.top < 60 || rect.top > 160) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = Math.max(0, scrollTop + rect.top - 84);
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
      }
    } else {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  }, []);

  // Load collections from public API with background sync support
  const loadCollections = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoadingCollections(true);
      }
      const res = await fetch("/api/design-collections", {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const cols: DesignCollection[] = data.collections || [];
      setCollections(cols);

      // Smart reconciliation of selectedDesign:
      setSelectedDesign((prev) => {
        if (!prev) {
          // If no design was selected, select the first available design
          if (cols.length > 0 && cols[0].designs.length > 0) {
            const firstCol = cols[0];
            const firstDesign = firstCol.designs[0];
            setActiveFolderId((currentFolder) => currentFolder || firstCol.id);
            return {
              id: firstDesign.id,
              title: firstDesign.title,
              imageUrl: firstDesign.imageUrl,
              collectionName: firstCol.name,
            };
          }
          return null;
        }

        // If the user uploaded a custom file from their own device, don't remove it
        if (prev.id.startsWith("custom-")) {
          return prev;
        }

        // Check if currently selected design still exists in the newly loaded collections
        let foundMatch: { id: string; title: string; imageUrl: string; collectionName?: string } | null = null;
        for (const col of cols) {
          const match = col.designs.find((d) => d.id === prev.id);
          if (match) {
            foundMatch = {
              id: match.id,
              title: match.title,
              imageUrl: match.imageUrl,
              collectionName: col.name,
            };
            break;
          }
        }

        if (foundMatch) {
          return foundMatch;
        }

        // If it was DELETED by an admin:
        showToast("Un diseño fue retirado del catálogo. Se actualizó el simulador.");
        // Pick first available design from any collection
        for (const col of cols) {
          if (col.designs.length > 0) {
            const firstDesign = col.designs[0];
            setActiveFolderId(col.id);
            return {
              id: firstDesign.id,
              title: firstDesign.title,
              imageUrl: firstDesign.imageUrl,
              collectionName: col.name,
            };
          }
        }
        return null;
      });

      // Smart reconciliation of activeFolderId:
      setActiveFolderId((prevFolderId) => {
        if (!prevFolderId) {
          return cols.length > 0 ? cols[0].id : null;
        }
        const folderStillExists = cols.some((c) => c.id === prevFolderId);
        if (!folderStillExists) {
          return cols.length > 0 ? cols[0].id : null;
        }
        return prevFolderId;
      });
    } catch (err) {
      console.error("Error al sincronizar colecciones:", err);
    } finally {
      if (!isBackground) {
        setLoadingCollections(false);
      }
    }
  }, [showToast]);

  // Initial load + Real-time cross-tab sync & background polling
  useEffect(() => {
    // 1. Initial load
    loadCollections(false);

    // 2. BroadcastChannel for instant cross-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("diamy_collections_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "SYNC") {
          loadCollections(true);
        }
      };
    } catch {
      // BroadcastChannel not supported in this environment
    }

    // 3. Storage event listener (fallback for cross-tab sync across windows/browsers)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "diamy_collections_sync") {
        loadCollections(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Window focus & visibility change (auto-refresh when user clicks back into this tab)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadCollections(true);
      }
    };
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    // 5. Silent heartbeat interval (every 10 seconds)
    const interval = setInterval(() => {
      loadCollections(true);
    }, 10000);

    return () => {
      if (bc) {
        try {
          bc.close();
        } catch { }
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [loadCollections]);

  // Update color if model changes and current color is not available in new model
  useEffect(() => {
    const exists = currentModel.colors.some((c) => c.name_en === currentColor.name_en);
    if (!exists) {
      const fallback =
        currentModel.colors.find((c) => c.name_en === "Black") ||
        currentModel.colors.find((c) => c.name_en === "White") ||
        currentModel.colors[0];
      setCurrentColor(fallback);
    }
  }, [currentModelKey, currentModel.colors, currentColor.name_en]);

  // Main Canvas Render
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Real Scene Photo Background
    const bgImg = backgroundPhotoRef.current;
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    // 2. Draw 3D Perspective Design
    const dImg = designImageRef.current;
    if (dImg && dImg.complete && dImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(designPos.x, designPos.y);
      ctx.rotate((designRotation * Math.PI) / 180);

      if (designSkew !== 0) {
        const skewRad = (designSkew * Math.PI) / 180;
        ctx.transform(1, 0, Math.tan(skewRad), 1, 0, 0);
      }

      const totalW = dImg.width * currentScene.baseScaleFactor * designScale;
      const totalH = dImg.height * currentScene.baseScaleFactor * designScale;

      ctx.globalCompositeOperation = designBlendMode;

      if (designTilt === 0) {
        ctx.drawImage(dImg, -totalW / 2, -totalH / 2, totalW, totalH);
      } else {
        // Perspective mesh slicing into 40 horizontal slices
        const slices = 40;
        const sliceSrcH = dImg.height / slices;
        const sliceDestH = totalH / slices;
        const tiltFactor = designTilt / 100.0;

        for (let i = 0; i < slices; i++) {
          const t = (i + 0.5) / slices;
          const scaleSliceW = 1.0 + (t - 0.5) * (tiltFactor * 2.0);
          const currentW = totalW * scaleSliceW;

          const sy = i * sliceSrcH;
          const dy = -totalH / 2 + i * sliceDestH;

          ctx.drawImage(
            dImg,
            0,
            sy,
            dImg.width,
            sliceSrcH,
            -currentW / 2,
            dy,
            currentW,
            sliceDestH + 0.5
          );
        }
      }

      ctx.restore();
    }

    // 3. Draw Luxury Color & Model Badge
    if (showBadge) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      const colorTitle = currentColor.name_es.toUpperCase();
      const modelTag = currentModel.tag.toUpperCase();
      const fullText = `${colorTitle}  •  ${modelTag}`;

      const baseFontSize = currentScene.id === "scene_wood" ? 18 : 15;
      const dotRadius = currentScene.id === "scene_wood" ? 11 : 9;
      const padX = 22;
      const padY = 14;

      ctx.font = `800 ${baseFontSize}px "Outfit", sans-serif`;
      const textMetrics = ctx.measureText(fullText);
      const textWidth = textMetrics.width;

      const bw = textWidth + dotRadius * 2 + padX * 2.5;
      const bh = baseFontSize + padY * 2.2;
      const margin = currentScene.id === "scene_wood" ? 36 : 24;

      const bx = margin;
      const by = canvas.height - bh - margin;

      // Dark luxury pill with gold accent
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = "rgba(12, 16, 22, 0.92)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, bh / 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowColor = "transparent";

      // Color Circle Dot
      const dotCx = bx + padX + dotRadius;
      const dotCy = by + bh / 2;
      ctx.fillStyle = currentColor.hex;
      ctx.beginPath();
      ctx.arc(dotCx, dotCy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 ${baseFontSize}px "Outfit", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(fullText, dotCx + dotRadius + 12, dotCy);

      ctx.restore();
    }
  }, [
    currentScene,
    currentColor,
    currentModel,
    designPos,
    designScale,
    designRotation,
    designTilt,
    designSkew,
    designBlendMode,
    showBadge,
  ]);

  // Load background image whenever scene or color changes
  useEffect(() => {
    const bgPath = getMockupSceneImagePath(currentScene.id, currentColor.name_en);
    const img = new Image();
    img.src = bgPath;
    img.onload = () => {
      backgroundPhotoRef.current = img;
      renderCanvas();
    };
  }, [currentScene.id, currentColor.name_en, renderCanvas]);

  // Load design image whenever selectedDesign changes
  useEffect(() => {
    if (!selectedDesign?.imageUrl) {
      designImageRef.current = null;
      renderCanvas();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedDesign.imageUrl;
    img.onload = () => {
      designImageRef.current = img;
      // Auto-center and reset tilt/scale to scene optimal
      setDesignPos({ ...currentScene.defaultPos });
      setDesignTilt(currentScene.defaultTilt);
      setDesignSkew(currentScene.defaultSkew);
      renderCanvas();
    };
  }, [selectedDesign, currentScene, renderCanvas]);

  // Redraw when transforms change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Switch Scene
  const handleSelectScene = (scene: MockupSceneConfig) => {
    setCurrentScene(scene);
    setDesignPos({ ...scene.defaultPos });
    setDesignTilt(scene.defaultTilt);
    setDesignSkew(scene.defaultSkew);
    showToast(`Escena cambiada: ${scene.name}`);
  };

  // Switch Model
  const handleSelectModel = (key: '410c' | '410d' | '410n') => {
    setCurrentModelKey(key);
    showToast(`Modelo: ${PLAYERYTEES_MODELS[key].name} (${PLAYERYTEES_MODELS[key].tag})`);
  };

  // Switch Color
  const handleSelectColor = (col: TShirtColor) => {
    setCurrentColor(col);
  };

  // Apply a design from collections
  const handleApplyDesign = (design: DesignAsset, colName: string) => {
    setSelectedDesign({
      id: design.id,
      title: design.title,
      imageUrl: design.imageUrl,
      collectionName: colName,
    });
    setDesignPos({ ...currentScene.defaultPos });
    setDesignScale(1.0);
    setDesignRotation(0);
    showToast(`¡"${design.title}" aplicado al mockup!`);

    // Auto smooth scroll to mockup on both PC and mobile
    scrollToMockup();
  };

  // Upload custom design from user's phone or computer
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const title = file.name.replace(/\.[^.]+$/, "").slice(0, 30);
      setSelectedDesign({
        id: `custom-${Date.now()}`,
        title: `Mi Diseño (${title})`,
        imageUrl: dataUrl,
        collectionName: "Subido por ti",
      });
      setDesignPos({ ...currentScene.defaultPos });
      setDesignScale(1.0);
      setDesignRotation(0);
      showToast("¡Tu diseño se cargó y ajustó al centro de la playera!");

      // Auto smooth scroll to mockup on both PC and mobile
      scrollToMockup();
    };
    reader.readAsDataURL(file);
  };

  // Center design button
  const handleCenterDesign = () => {
    setDesignPos({ ...currentScene.defaultPos });
    showToast("Diseño centrado en el pecho");
  };

  // Reset transforms
  const handleResetTransforms = () => {
    setDesignPos({ ...currentScene.defaultPos });
    setDesignScale(1.0);
    setDesignRotation(0);
    setDesignTilt(currentScene.defaultTilt);
    setDesignSkew(currentScene.defaultSkew);
    setDesignBlendMode("source-over");
    showToast("Ajustes restablecidos");
  };

  // Mouse & Touch Dragging helpers
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setIsDragging(true);
    dragStartRef.current = {
      x: coords.x - designPos.x,
      y: coords.y - designPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDesignPos({
      x: Math.round(coords.x - dragStartRef.current.x),
      y: Math.round(coords.y - dragStartRef.current.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  };

  // Capture canvas & Download HD Image
  const handleDownloadHD = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const filename = `Diamy-Mockup-${currentColor.name_es}-${currentModelKey}-${selectedDesign ? selectedDesign.title : "Playera"}.png`.replace(
      /\s+/g,
      "_"
    );
    link.download = filename;
    link.href = dataUrl;
    link.click();
    showToast("¡Mockup HD descargado en tu dispositivo!");
  };

  // Capture & Share to WhatsApp with image hosting, clipboard copy & native share
  const handleShareWhatsApp = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCapturing(true);
    showToast("Preparando captura del mockup...");

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const filename = `Diamy-Mockup-${currentColor.name_es}-${currentModelKey}.png`.replace(/\s+/g, "_");

      // 1. Convert canvas to Blob for Clipboard & Web Share
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

      // 2. Upload snapshot to server to get public hosted image URL for WhatsApp link preview
      let hostedImageUrl = "";
      try {
        const uploadRes = await fetch("/api/mockup/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataUrl,
            title: selectedDesign ? selectedDesign.title : "Playera",
            color: currentColor.name_es,
          }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          hostedImageUrl = uploadData.fullUrl || "";
        }
      } catch (uploadErr) {
        console.warn("No se pudo alojar la imagen temporalmente:", uploadErr);
      }

      // 3. Build WhatsApp message text (using clean universal characters to avoid '??' encoding glitches)
      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "523211144447";
      const designName = selectedDesign ? selectedDesign.title : "Mi diseño personalizado";
      const colName = selectedDesign?.collectionName ? `(${selectedDesign.collectionName})` : "";

      let message = `¡Hola Diamy Laser Cut! 👋\n\nAcabo de crear mi mockup personalizado en su simulador web:\n\n• Prenda: Playera ${currentModel.name} (${currentModel.tag})\n• Color: ${currentColor.name_es} (${currentColor.name_en})\n• Estampado: ${designName} ${colName}\n• Escena: ${currentScene.name}\n`;

      if (hostedImageUrl) {
        message += `\n📸 Ver Mockup HD: ${hostedImageUrl}\n`;
      }

      message += `\n¿Me podrían cotizar esta prenda con estampado DTF y darme tiempo de entrega? ¡Gracias!`;

      // 4. On Mobile: Try Web Share API (which directly attaches the PNG image file into WhatsApp!)
      if (blob && typeof navigator !== "undefined" && navigator.canShare) {
        const shareFile = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [shareFile] })) {
          try {
            await navigator.share({
              files: [shareFile],
              title: "Mockup Playera Diamy",
              text: message,
            });
            setIsCapturing(false);
            showToast("¡Mockup compartido exitosamente!");
            return;
          } catch (shareErr) {
            // If user dismissed share sheet, continue to fallback
            if ((shareErr as Error).name !== "AbortError") {
              console.warn("Web Share falló, usando enlace directo:", shareErr);
            }
          }
        }
      }

      // 5. On Desktop: Copy image to Clipboard so user can simply paste (Ctrl+V) in WhatsApp Web
      if (blob && typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showToast("¡Imagen copiada al portapapeles! Puedes pegarla con Ctrl + V en WhatsApp");
        } catch (clipErr) {
          console.warn("No se pudo copiar al portapapeles:", clipErr);
        }
      }

      // 6. Also trigger local download as backup
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = dataUrl;
      downloadLink.click();

      // 7. Open WhatsApp chat with prefilled message
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        window.open(waUrl, "_blank");
        setIsCapturing(false);
      }, 500);
    } catch (err) {
      console.error("Error al compartir en WhatsApp:", err);
      setIsCapturing(false);
      showToast("Error al generar la captura para WhatsApp");
    }
  };

  // Pagination State for Collection Designs (20 designs per page)
  const [currentPage, setCurrentPage] = useState(1);
  const DESIGNS_PER_PAGE = 20;
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const activeFolder = collections.find((c) => c.id === activeFolderId);
  const filteredDesigns = activeFolder
    ? activeFolder.designs.filter((d) =>
      d.title.toLowerCase().includes(searchFilter.toLowerCase())
    )
    : [];

  const totalPages = Math.ceil(filteredDesigns.length / DESIGNS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * DESIGNS_PER_PAGE;
  const endIndex = Math.min(startIndex + DESIGNS_PER_PAGE, filteredDesigns.length);
  const paginatedDesigns = filteredDesigns.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (galleryRef.current) {
      const rect = galleryRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = Math.max(0, scrollTop + rect.top - 84);
      window.scrollTo({
        top: targetY,
        behavior: "smooth",
      });
    }
  };

  const handleSelectFolder = (folderId: string | null) => {
    setActiveFolderId(folderId);
    setCurrentPage(1);
    setSearchFilter("");
  };

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161b24] border border-[#d4af37]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP STUDIO GRID: Mockup Canvas + Controls */}
      <div ref={mockupContainerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
        {/* LEFT COLUMN: The Mockup Canvas Box (Sticky on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Mockup Canvas Container with Glassmorphism Frame */}
          <div className="relative group bg-[#0e1218] rounded-3xl border border-white/10 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Top Toolbar Badges */}
            <div className="flex items-center justify-between gap-2 mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white/90 tracking-wide uppercase font-serif">
                  Simulador DTF HD
                </span>
                <span className="hidden sm:inline text-xs text-white/40">· Arrastra para mover</span>
              </div>

              {/* Quick Actions overlay */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCenterDesign}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 transition"
                  title="Centrar diseño al pecho"
                >
                  <span className="material-symbol" style={{ fontSize: "14px" }}>filter_center_focus</span>
                  <span className="hidden sm:inline">Centrar</span>
                </button>
                <button
                  onClick={handleResetTransforms}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 transition"
                  title="Restablecer tamaño y posición"
                >
                  <span className="material-symbol" style={{ fontSize: "14px" }}>restart_alt</span>
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={() => setShowBadge(!showBadge)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${showBadge
                      ? "bg-[#d4af37]/20 border-[#d4af37]/50 text-[#d4af37]"
                      : "bg-white/5 border-white/10 text-white/60"
                    }`}
                  title="Mostrar/Ocultar etiqueta de color"
                >
                  <span className="material-symbol" style={{ fontSize: "14px" }}>label</span>
                  <span className="hidden sm:inline">Etiqueta</span>
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-black select-none cursor-move">
              <canvas
                ref={canvasRef}
                width={1024}
                height={1024}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full object-contain touch-none block"
              />

              {/* Floating Fine-Tuning Drawer Trigger Button */}
              <button
                onClick={() => setShowControlsDrawer(!showControlsDrawer)}
                className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white/90 border border-white/20 text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 transition"
              >
                <span className="material-symbol" style={{ fontSize: "16px" }}>tune</span>
                {showControlsDrawer ? "Ocultar Controles" : "Ajustar Tamaño y Ángulo"}
              </button>
            </div>

            {/* Collapsible Canvas Fine-Tuning Drawer */}
            {showControlsDrawer && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scale Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-semibold">Tamaño del Estampado</span>
                      <span className="text-[#d4af37] font-mono font-bold">
                        {Math.round(designScale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.0"
                      step="0.05"
                      value={designScale}
                      onChange={(e) => setDesignScale(parseFloat(e.target.value))}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-semibold">Rotación</span>
                      <span className="text-[#d4af37] font-mono font-bold">{designRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={designRotation}
                      onChange={(e) => setDesignRotation(parseInt(e.target.value))}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                  </div>

                  {/* Perspective Tilt Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-semibold">Inclinación 3D (Perspectiva)</span>
                      <span className="text-[#d4af37] font-mono font-bold">{designTilt}%</span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="25"
                      step="1"
                      value={designTilt}
                      onChange={(e) => setDesignTilt(parseInt(e.target.value))}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                  </div>

                  {/* Blend Mode */}
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-semibold block">Efecto de Impresión</label>
                    <select
                      value={designBlendMode}
                      onChange={(e) => setDesignBlendMode(e.target.value as GlobalCompositeOperation)}
                      className="w-full bg-[#141820] text-xs text-white border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="source-over">DTF Textil Estándar (Opaco Nítido)</option>
                      <option value="multiply">Serigrafía / Tacto Cero (Integrado)</option>
                      <option value="hard-light">Foil Metálico / Tinta Brillante</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (Screenshot & WhatsApp Sharing) */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Share Button */}
              <button
                onClick={handleShareWhatsApp}
                disabled={isCapturing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm shadow-xl hover:shadow-25d366/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 group"
              >
                <span className="material-symbol text-xl group-hover:rotate-12 transition-transform">
                  chat
                </span>
                {isCapturing ? "Generando captura..." : "📸 Compartir en WhatsApp"}
              </button>

              {/* Download HD Button */}
              <button
                onClick={handleDownloadHD}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0c0e12] font-black text-sm shadow-lg hover:shadow-[#d4af37]/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <span className="material-symbol text-xl">download</span>
                💾 Descargar Mockup HD
              </button>

              {/* Informative Help Hint */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[11px] text-white/70 leading-relaxed">
                  💡 <span className="text-[#d4af37] font-semibold">¿Cómo se envía la imagen?</span> El mensaje incluye el <span className="underline">enlace directo en HD</span> y además la foto se copia a tu portapapeles. En WhatsApp Web solo presiona <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Ctrl + V</kbd> para pegarla al instante. En celular, se comparte adjunta directamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Studio Selectors (Scenes, Models, Colors) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* 1. SCENE SELECTOR */}
          <div className="bg-[#121620] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif tracking-wide">
                <span>🎬</span> Escena de Mockup
              </h3>
              <span className="text-[11px] text-[#d4af37] font-semibold">2 escenas reales</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {MOCKUP_SCENES.map((scene) => {
                const isSelected = currentScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(scene)}
                    className={`p-3 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${isSelected
                        ? "bg-[#d4af37]/10 border-[#d4af37] shadow-lg shadow-[#d4af37]/10 ring-1 ring-[#d4af37]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                      }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block line-clamp-1">
                        {scene.name}
                      </span>
                      <span className="text-[10px] text-white/50 block mt-0.5 line-clamp-1">
                        {scene.id === "scene_wood" ? "Mesa Madera" : "Taller DTF"}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="material-symbol text-[#d4af37] self-end mt-2" style={{ fontSize: "16px" }}>
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MODEL SELECTOR */}
          <div className="bg-[#121620] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif tracking-wide">
                <span>👕</span> Modelo de Playera
              </h3>
              <span className="text-[11px] text-[#d4af37] font-semibold font-mono">
                {currentModel.tag}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["410c", "410d", "410n"] as const).map((key) => {
                const model = PLAYERYTEES_MODELS[key];
                const isSelected = currentModelKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectModel(key)}
                    className={`py-2 px-3 rounded-xl border text-center transition ${isSelected
                        ? "bg-[#d4af37] text-[#0c0e12] font-black border-[#d4af37] shadow-md shadow-[#d4af37]/20"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 font-semibold"
                      } text-xs`}
                  >
                    {model.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-white/50">{currentModel.description}</p>
          </div>

          {/* 3. COLOR SWATCHES SELECTOR */}
          <div className="bg-[#121620] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif tracking-wide">
                  <span>🎨</span> Color de la Playera
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Haz clic para cambiar el color instantáneamente
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#d4af37]">
                {currentModel.colors.length} colores
              </span>
            </div>

            {/* Active Color Info Pill */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {currentColor.name_es}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                    {currentColor.name_en}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-white/40">{currentColor.hex}</span>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-black/40 rounded-xl max-h-56 overflow-y-auto border border-white/5">
              {currentModel.colors.map((color) => {
                const isSelected = currentColor.name_en === color.name_en;
                const isWhite = color.hex.toLowerCase() === "#ffffff";
                return (
                  <button
                    key={color.name_en}
                    onClick={() => handleSelectColor(color)}
                    title={`${color.name_es} (${color.name_en})`}
                    className={`w-9 h-9 rounded-xl transition-all duration-150 relative flex items-center justify-center ${isSelected
                        ? "scale-110 shadow-lg ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#121620] z-10"
                        : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                    style={{
                      backgroundColor: color.hex,
                      border: isWhite ? "1px solid #444" : "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {isSelected && (
                      <span
                        className="material-symbol"
                        style={{
                          fontSize: "16px",
                          color: isWhite ? "#000000" : "#ffffff",
                        }}
                      >
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CURRENT APPLIED DESIGN INFO */}
          {selectedDesign && (
            <div className="bg-[#121620] rounded-2xl border border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border border-white/20 p-1 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: "#1c2028",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedDesign.imageUrl}
                    alt={selectedDesign.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block line-clamp-1">
                    {selectedDesign.title}
                  </span>
                  <span className="text-[10px] text-[#d4af37] block">
                    {selectedDesign.collectionName || "Catálogo DTF"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCenterDesign}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs flex items-center gap-1 transition"
                title="Centrar en la playera"
              >
                <span className="material-symbol" style={{ fontSize: "16px" }}>filter_center_focus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LOWER SECTION: FOLDER & DESIGN EXPLORER */}
      <div className="bg-[#0e1218] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Explorer Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">📂</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
                  Explorador de Colecciones y Estampados
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                  Elige una carpeta temática para ver sus diseños o sube tu propio archivo PNG transparente.
                </p>
              </div>
            </div>
          </div>

          {/* Subir Mi Propio Diseño CTA */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={customFileInputRef}
              onChange={handleCustomUpload}
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              className="hidden"
              id="user-custom-upload"
            />
            <label
              htmlFor="user-custom-upload"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 border border-[#d4af37]/50 text-[#d4af37] font-bold text-xs sm:text-sm shadow-lg hover:bg-[#d4af37]/30 cursor-pointer transition"
            >
              <span className="material-symbol" style={{ fontSize: "18px" }}>upload</span>
              Subir Mi Propio Diseño PNG
            </label>
          </div>
        </div>

        {/* FOLDERS TABS / SELECTOR BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => handleSelectFolder(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${activeFolderId === null
                ? "bg-[#d4af37] text-[#0c0e12] border-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
          >
            <span>📁</span> Todas las Colecciones ({collections.length})
          </button>

          {collections.map((col) => {
            const isSelected = activeFolderId === col.id;
            return (
              <button
                key={col.id}
                onClick={() => handleSelectFolder(col.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${isSelected
                    ? "bg-[#d4af37] text-[#0c0e12] border-[#d4af37] shadow-lg shadow-[#d4af37]/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                  }`}
              >
                <span>{col.icon || "📁"}</span>
                <span>{col.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#0c0e12]/30 text-[#0c0e12]" : "bg-white/10 text-white/60"
                  }`}>
                  {col.designs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* EXPLORER CONTENT */}
        {loadingCollections ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : activeFolderId === null ? (
          /* ALL FOLDERS VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSelectFolder(col.id)}
                className="group bg-[#141822] hover:bg-[#1a202c] p-6 rounded-2xl border border-white/10 hover:border-[#d4af37]/60 cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {col.icon || "📁"}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] font-semibold border border-[#d4af37]/20">
                      {col.designs.length} diseños
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-[#d4af37] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">
                    {col.description || "Explora los estampados disponibles en esta carpeta."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#d4af37] font-semibold">
                  <span>Abrir Galería</span>
                  <span className="material-symbol group-hover:translate-x-1 transition-transform" style={{ fontSize: "16px" }}>
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* INSIDE ACTIVE FOLDER GALLERY */
          activeFolder && (
            <div ref={galleryRef} className="space-y-4 scroll-mt-24">
              {/* Folder Breadcrumb & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#141822] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeFolder.icon || "📁"}</span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">{activeFolder.name}</h3>
                    <p className="text-xs text-white/50">{activeFolder.description || `${activeFolder.designs.length} diseños disponibles`}</p>
                  </div>
                </div>

                {/* Search in folder */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Buscar diseño..."
                    value={searchFilter}
                    onChange={(e) => {
                      setSearchFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#0e1218] border border-white/15 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                  <span className="material-symbol absolute left-3 top-2.5 text-white/40" style={{ fontSize: "16px" }}>
                    search
                  </span>
                </div>
              </div>

              {/* Designs Grid */}
              {filteredDesigns.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 p-6">
                  <p className="text-sm text-white/60">No se encontraron diseños que coincidan con la búsqueda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {paginatedDesigns.map((design) => {
                      const isSelected = selectedDesign?.id === design.id;
                      return (
                        <div
                          key={design.id}
                          onClick={() => handleApplyDesign(design, activeFolder.name)}
                          className={`group bg-[#141822] rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${isSelected
                              ? "border-[#d4af37] ring-2 ring-[#d4af37]/50 shadow-xl shadow-[#d4af37]/10 scale-[1.02]"
                              : "border-white/10 hover:border-white/30 hover:scale-[1.02]"
                            }`}
                        >
                          {/* Checkerboard container for transparent PNG */}
                          <div
                            className="w-full aspect-square p-4 flex items-center justify-center relative"
                            style={{
                              backgroundColor: "#161920",
                              backgroundImage: `
                                linear-gradient(45deg, #1c2028 25%, transparent 25%),
                                linear-gradient(-45deg, #1c2028 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, #1c2028 75%),
                                linear-gradient(-45deg, transparent 75%, #1c2028 75%)
                              `,
                              backgroundSize: "16px 16px",
                              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={design.imageUrl}
                              alt={design.title}
                              className="max-w-full max-h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-200"
                              loading="lazy"
                            />

                            {isSelected && (
                              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d4af37] text-[#0c0e12] flex items-center justify-center shadow">
                                <span className="material-symbol" style={{ fontSize: "16px" }}>check</span>
                              </span>
                            )}
                          </div>

                          {/* Title and Tap hint */}
                          <div className="p-3 bg-[#11141c] border-t border-white/5 flex-1 flex flex-col justify-between">
                            <h4 className="text-xs font-semibold text-white/90 group-hover:text-[#d4af37] truncate transition-colors">
                              {design.title}
                            </h4>
                            <span className="text-[10px] text-white/40 mt-1 flex items-center gap-1 group-hover:text-[#d4af37]/80">
                              <span className="material-symbol" style={{ fontSize: "12px" }}>touch_app</span>
                              Tocar para probar
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 mt-6 bg-[#121622]/60 p-4 rounded-2xl border border-white/5">
                      <div className="text-xs text-white/60 order-2 sm:order-1">
                        Mostrando <span className="font-bold text-white">{startIndex + 1}</span> -{" "}
                        <span className="font-bold text-white">{endIndex}</span> de{" "}
                        <span className="font-bold text-[#d4af37]">{filteredDesigns.length}</span> diseños (Pág. {safeCurrentPage} de {totalPages})
                      </div>

                      <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                        <button
                          onClick={() => handlePageChange(safeCurrentPage - 1)}
                          disabled={safeCurrentPage === 1}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                          title="Página anterior"
                        >
                          <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_left</span>
                          <span>Anterior</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const isCurrent = pageNum === safeCurrentPage;
                            const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                            const isNearCurrent = Math.abs(pageNum - safeCurrentPage) <= 1;

                            if (!isFirstOrLast && !isNearCurrent) {
                              if (pageNum === 2 || pageNum === totalPages - 1) {
                                return (
                                  <span key={`dots-${pageNum}`} className="px-1 text-white/30 text-xs select-none">
                                    •••
                                  </span>
                                );
                              }
                              return null;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                  isCurrent
                                    ? "bg-[#d4af37] text-[#0c0e12] shadow-md shadow-[#d4af37]/20 scale-105"
                                    : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(safeCurrentPage + 1)}
                          disabled={safeCurrentPage === totalPages}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                          title="Página siguiente"
                        >
                          <span>Siguiente</span>
                          <span className="material-symbol" style={{ fontSize: "16px" }}>chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
