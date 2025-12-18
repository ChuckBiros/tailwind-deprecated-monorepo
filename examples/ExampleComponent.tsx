import React from 'react';

// Ces classes devraient afficher un warning au survol
export function DeprecatedExample() {
  return (
    <div className="old-container">
      {/* Warning: tw-badge-old est déprécié */}
      <span className="tw-badge-old">Badge ancien</span>

      {/* Warning: btn-legacy est déprécié */}
      <button className="btn-legacy">Cliquez-moi</button>

      {/* Warning: text-custom-blue est déprécié */}
      <p className="text-custom-blue">Texte en bleu</p>

      {/* Warning: tw-badges-l et tw-badges-m (avec @apply) */}
      <span className="tw-badges-l">Badge L</span>
      <span className="tw-badges-m">Badge M</span>

      {/* Mélange de classes - seules les dépréciées auront un warning */}
      <div className="flex items-center tw-badge-old p-4 gap-2">
        Contenu mixte
      </div>
    </div>
  );
}

// Ces classes sont OK - pas de warning
export function ModernExample() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <span className="tw-badge-primary-sm">Nouveau badge</span>
      <button className="tw-button-primary">Nouveau bouton</button>
    </div>
  );
}

// Exemple avec template literals
export function TemplateExample({ isActive }: { isActive: boolean }) {
  return (
    <div className={`flex items-center ${isActive ? 'tw-badge-old' : 'tw-badge-primary-sm'}`}>
      État dynamique
    </div>
  );
}

