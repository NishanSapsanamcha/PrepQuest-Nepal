/**
 * Renders a premium badge slot. If `src` (an image asset path) is provided it
 * shows the artwork; otherwise it falls back to the built-in CSS icon passed as
 * children. Used by the Practice summary strip and subject cards so premium PNG
 * art can be dropped in later (see data/practiceIconAssets.js) with no code
 * changes and without any 404 requests for art that hasn't been added.
 */
function PremiumBadge({ src, alt = "", className = "", style, children }) {
  return (
    <span className={`${className}${src ? " has-img" : ""}`.trim()} style={style}>
      {src ? <img className="premium-badge-img" src={src} alt={alt} /> : children}
    </span>
  );
}

export default PremiumBadge;
