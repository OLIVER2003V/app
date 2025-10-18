{items.map((item) => {
  const src = item.media_file_url || item.media_file;
  const isVideo = (item.media_type || "").toUpperCase() === "VIDEO";

  return (
    <div key={item.id} className="carousel-item">
      {isVideo ? (
        <video
          src={src}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="carousel-video"
        />
      ) : (
        <img
          src={src}
          alt={item.title}
          className="carousel-image"
        />
      )}
      <div className="carousel-caption">
        <h2>{item.title}</h2>
      </div>
    </div>
  );
})}
