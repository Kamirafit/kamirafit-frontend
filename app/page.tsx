export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "rgba(230, 223, 193, 0.8)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      <h1 className="text-5xl font-extrabold text-black mb-4">
        Coming Soon...
      </h1>
      <p className="text-lg text-neutral-800 text-center max-w-xl">
        We are working hard to bring you something amazing. Stay tuned.
      </p>
    </div>
  );
}
