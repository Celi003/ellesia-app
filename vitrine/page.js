// Page de présentation d'Ellesia : liens de téléchargement, iPhone, apparitions.

/**
 * Téléchargement direct depuis Google Drive, sans passer par sa page : le
 * domaine drive.usercontent.google.com renvoie le fichier lui-même. Les
 * fichiers doivent être partagés à « Tous les utilisateurs disposant du lien ».
 *
 * Devant un APK, Drive intercale un avertissement d'analyse antivirus, en
 * anglais ; confirm=t est la réponse que son propre formulaire envoie, et le
 * fichier part aussitôt.
 *
 * Seul endroit à changer à chaque nouvelle version : l'identifiant du fichier,
 * c'est-à-dire la partie entre /d/ et /view dans le lien de partage de Drive.
 */
const FICHIERS_DRIVE = {
  arm64: '134nwKjZPq4TjsCKxpcX9WqRuP1MBKjzu',
  armv7: null,
};

const lienDirect = (identifiant) =>
  `https://drive.usercontent.google.com/download?id=${encodeURIComponent(identifiant)}&export=download&confirm=t`;

function brancherTelechargements() {
  for (const lien of document.querySelectorAll('[data-lien]')) {
    const identifiant = FICHIERS_DRIVE[lien.dataset.lien];
    if (identifiant) {
      lien.href = lienDirect(identifiant);
      lien.removeAttribute('aria-disabled');
      continue;
    }

    // Pas encore de fichier en ligne : le bouton principal le dit plutôt que
    // de mener nulle part, et le lien de rechange disparaît avec sa phrase.
    const libelle = lien.querySelector('span');
    if (libelle) {
      lien.setAttribute('aria-disabled', 'true');
      lien.removeAttribute('href');
      libelle.textContent = 'Bientôt disponible';
    } else {
      lien.closest('.secondaire')?.setAttribute('hidden', '');
    }
  }
}

/** Sur iPhone, pas de bouton qui ne mènerait à rien : un mot d'explication. */
function adapterIphone() {
  const iphone =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!iphone) return;

  for (const bloc of document.querySelectorAll('[data-telechargement]')) bloc.hidden = true;
  for (const message of document.querySelectorAll('[data-iphone]')) message.hidden = false;
}

/**
 * Les sections encore sous l'écran apparaissent en douceur quand on y arrive.
 *
 * Rien n'est masqué sans raison : une section déjà visible au chargement le
 * reste. Chaque section masquée est révélée par deux voies, l'observateur et
 * le défilement, au cas où l'une ferait défaut sur un vieux navigateur.
 */
function animerApparitions() {
  const hauteur = () => window.innerHeight || document.documentElement.clientHeight;
  const enAttente = [...document.querySelectorAll('.apparait')].filter(
    (section) => section.getBoundingClientRect().top > hauteur(),
  );
  if (enAttente.length === 0) return;

  for (const section of enAttente) section.classList.add('a-venir');
  const reveler = (section) => section.classList.remove('a-venir');

  if ('IntersectionObserver' in window) {
    const observateur = new IntersectionObserver((entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        reveler(entree.target);
        observateur.unobserve(entree.target);
      }
    });
    for (const section of enAttente) observateur.observe(section);
  }

  let prevu = false;
  window.addEventListener(
    'scroll',
    () => {
      if (prevu) return;
      prevu = true;
      requestAnimationFrame(() => {
        prevu = false;
        for (const section of enAttente) {
          if (section.getBoundingClientRect().top < hauteur()) reveler(section);
        }
      });
    },
    { passive: true },
  );
}

document.addEventListener('DOMContentLoaded', () => {
  brancherTelechargements();
  adapterIphone();
  animerApparitions();
});
