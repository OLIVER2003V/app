import { useMemo, useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay, A11y, EffectFade, Keyboard } from "swiper/modules";
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Play } from "lucide-react";
import clsx from "clsx";

// CSS de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/thumbs";

// Estilos personalizados
import "./HeroCarousel.css";

const AUTOPLAY_DELAY = 6000;

const SlideContent = ({ item, isActive, index, total }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsMuted(true);
      }
    }
  }, [isActive, isVideo]);

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className={clsx("slide-content relative h-full w-full bg-slate-900", { "is-active": isActive })}>
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={item.src}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onClick={toggleSound}
          />
          <button
            onClick={toggleSound}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </>
      ) : (
        <img
          className="slide-media-image h-full w-full object-cover"
          src={item.src}
          alt={item.title || "Slide"}
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/10 to-black/10 pointer-events-none" />

      <div className="absolute bottom-3 left-0 w-full z-20 px-6 md:px-12 pointer-events-none">
        <div className="flex items-end justify-between gap-4">
          <div className={`transform transition-all duration-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {item.title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-xl tracking-tight leading-none">
                {item.title}
              </h2>
            )}
          </div>
          <span className={`hidden sm:block shrink-0 pb-1 font-black text-white drop-shadow-lg tabular-nums transition-opacity duration-700 ${isActive ? 'opacity-90' : 'opacity-0'}`}>
            <span className="text-xl md:text-2xl">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-sm md:text-base text-white/50"> / {String(total).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export function HeroCarousel({ items = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  if (!slides.length) return null;

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] border border-white/20 ring-1 ring-black/5 group hover:shadow-[0_30px_70px_-15px_rgba(6,182,212,0.4)] transition-all duration-500"
      aria-label="Galería principal"
    >
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Main Carousel with Aspect Ratio */}
        <div className="relative aspect-video md:aspect-[21/9] w-full">
          {/* Barra de progreso estilo "historias": muestra cuánto falta para
              el siguiente slide y cuántos hay en total de un vistazo. */}
          {slides.length > 1 && (
            <div className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-30 flex gap-1.5 pointer-events-none">
              {slides.map((_, i) => (
                <div key={i} className="h-[3px] flex-1 rounded-full bg-white/25 overflow-hidden">
                  {i < activeIndex && <div className="h-full w-full bg-white" />}
                  {i === activeIndex && (
                    <div
                      key={activeIndex}
                      className="hero-progress-fill h-full bg-white"
                      style={{ animationDuration: `${AUTOPLAY_DELAY}ms` }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button ref={prevBtnRef} aria-label="Foto anterior" className="hero-nav-btn hero-nav-prev">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button ref={nextBtnRef} aria-label="Foto siguiente" className="hero-nav-btn hero-nav-next">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <Swiper
            modules={[Navigation, Thumbs, Autoplay, A11y, EffectFade, Keyboard]}
            slidesPerView={1}
            loop={true}
            effect="fade"
            speed={1000}
            autoplay={{
              delay: AUTOPLAY_DELAY,
              disableOnInteraction: false,
            }}
            navigation={{ prevEl: prevBtnRef.current, nextEl: nextBtnRef.current }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevBtnRef.current;
              swiper.params.navigation.nextEl = nextBtnRef.current;
            }}
            keyboard={{ enabled: true }}
            className="h-full w-full"
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {slides.map((item, i) => (
              <SwiperSlide key={item.id}>
                {({ isActive }) => (
                  <SlideContent item={item} isActive={isActive} index={i} total={slides.length} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Tira de miniaturas estilo "cartelera de cine": pegadas entre sí,
            sin bordes redondeados individuales, sobre fondo oscuro sólido —
            el tratamiento clásico de un filmstrip fotográfico profesional
            (Lightroom, Google/Apple Photos). La activa se distingue por
            brillo (las demás se atenúan) y una barra fina semi-transparente
            superpuesta en el borde inferior de su propia miniatura: al vivir
            dentro de la miniatura, se mueve sola junto con el scroll, sin
            necesitar medir posiciones aparte (eso causaba que, al agrandar
            la miniatura activa con una escala, tapara a la de al lado y
            "robara" el clic al querer retroceder). */}
        <div className="hero-carousel-thumbs relative bg-slate-950">
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={false}
            spaceBetween={0}
            slidesPerView={'auto'}
            watchSlidesProgress={true}
            modules={[Thumbs]}
          >
            {slides.map((item, index) => {
              const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";
              return (
                <SwiperSlide
                  key={item.id}
                  className={clsx("thumbnail-slide", { "is-active": index === activeIndex })}
                >
                  <img
                    src={item.src}
                    alt={`Miniatura de ${item.title}`}
                    className="thumbnail-img"
                  />
                  {isVideo && (
                    <span className="thumbnail-play">
                      <Play className="h-3.5 w-3.5" fill="white" strokeWidth={0} />
                    </span>
                  )}
                  <span className="thumbnail-bar" />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="absolute inset-0 pointer-events-none border-[4px] sm:border-[6px] border-white/10 rounded-2xl sm:rounded-3xl z-20"></div>
    </div>
  );
}
