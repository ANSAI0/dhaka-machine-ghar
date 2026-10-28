// "Add to cart" flourish: a small copy of the product image flies along an arc into the
// visible cart icon ([data-cart-target]), which then bounces. Browser-only.

function visibleCartTarget(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return (
    all.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }) ?? null
  );
}

function bounce(el: HTMLElement) {
  el.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
}

export function flyToCart(source: HTMLElement | null) {
  if (typeof window === "undefined") return;
  const target = visibleCartTarget();
  if (!target) return;
  if (!source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bounce(target);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 120);
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const dx = to.left + to.width / 2 - (startX + size / 2);
  const dy = to.top + to.height / 2 - (startY + size / 2);

  const ghost = document.createElement("div");
  const img = source.querySelector("img");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: "9999",
    pointerEvents: "none",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } satisfies Partial<CSSStyleDeclaration>);
  if (img?.currentSrc || img?.src) {
    const copy = document.createElement("img");
    copy.src = img.currentSrc || img.src;
    Object.assign(copy.style, { width: "100%", height: "100%", objectFit: "contain", padding: "6px" });
    ghost.appendChild(copy);
  } else {
    // Products without a photo: fly the placeholder icon instead.
    ghost.innerHTML = source.innerHTML;
  }
  document.body.appendChild(ghost);

  // Lift up first, then swoop into the cart while shrinking.
  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, borderRadius: "16px" },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 80}px) scale(0.7)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.6, borderRadius: "50%" },
    ],
    { duration: 800, easing: "cubic-bezier(.5,0,.2,1)" },
  );
  anim.onfinish = () => {
    ghost.remove();
    bounce(target);
  };
}
