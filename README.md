# ⛏ Minecraft 2D

Un clone Minecraft 2D jouable dans le navigateur, écrit en JavaScript vanilla avec rendu Canvas.

![Minecraft 2D Screenshot](screenshot.png)

## 🎮 Jouer

Ouvrir `index.html` dans un navigateur moderne, ou héberger sur GitHub Pages.

**[▶ Jouer en ligne](https://votre-username.github.io/minecraft2d/)**

## 🕹️ Contrôles

| Touche | Action |
|--------|--------|
| `WASD` / Flèches | Se déplacer |
| `Espace` | Sauter |
| `Clic Gauche` (maintenu) | Miner un bloc |
| `Clic Droit` | Placer un bloc |
| `1-9` | Sélectionner hotbar |
| `Molette` | Changer d'item |
| `E` | Ouvrir l'inventaire |

## ✨ Fonctionnalités

- **Génération procédurale** : terrain, grottes, minerais, arbres
- **20 types de blocs** : herbe, pierre, minerais (charbon, fer, or, diamant), bois, feuilles, eau, lave, bedrock, planches, verre, torche, table de craft, fourneau
- **Physique** : gravité, saut, collisions
- **Mining** avec temps proportionnel à la dureté
- **Inventaire** 36 slots avec hotbar
- **Rendu pixel-art** avec textures procédurales
- **Système de caméra** fluide centré sur le joueur
- **Ombrage** souterrain progressif
- **Ciel** avec soleil, fond dégradé

## 🗂️ Structure

```
minecraft2d/
├── index.html        # Page principale
├── style.css         # Styles (UI, menus, HUD)
├── js/
│   ├── constants.js  # Constantes globales, IDs des blocs
│   ├── blocks.js     # Définitions + rendu pixel-art de chaque bloc
│   ├── world.js      # Génération et gestion du monde
│   ├── player.js     # Entité joueur, physique, inventaire
│   ├── renderer.js   # Moteur de rendu Canvas
│   ├── ui.js         # HUD, hotbar, inventaire
│   └── game.js       # Boucle principale, inputs
└── README.md
```

## 🛠️ Technologies

- **HTML5 Canvas** pour le rendu
- **JavaScript ES6** vanilla, sans framework
- **CSS3** pour l'UI avec la police Press Start 2P (pixel-art)

## 🚀 Déploiement GitHub Pages

1. Fork / clone ce repo
2. Aller dans **Settings → Pages**
3. Source: **Deploy from a branch → main → / (root)**
4. Le jeu sera disponible à `https://username.github.io/minecraft2d/`

## 📜 Licence

MIT — libre d'utilisation et de modification.
