```markdown
# Chord Grid Generator (prototype)

But: cochetantoine-design/chord-grid-generator

Description
-----------
Interface web pour générer des grilles d'accords sur une page A4.
- En-tête : titre (souligné) + tempo (max 3 cm de hauteur).
- Colonne gauche : 6 cm pour les noms des parties (MAJUSCULE, max 8 caractères).
- Grille : mesures carrées de 1,5 cm (possibilité de diviser diagonale).
- Espacement entre parties : 3 mm.
- Pied de page : zone commentaires, 4 lignes en corps 12.
- Export PDF via l'impression navigateur.
- Transposition globale (▲ / ▼) suivant l'échelle : A ; Bb ; B ; C ; C# ; D ; Eb ; E ; F ; F# ; G ; Ab.

Fichiers
--------
- index.html — interface et structure
- styles.css — styles (dimensions en cm pour A4)
- app.js — logique (ajout des parties, édition des mesures, transposition, export)

Utilisation
-----------
1. Ouvrir `index.html` dans un navigateur moderne (Chrome/Firefox).
2. Modifier le nom du morceau et le tempo en haut.
3. Ajouter une partie avec "Ajouter une partie".
4. Cliquer sur le nom d'une partie pour le renommer (MAJUSCULE, max 8 caractères).
5. Cliquer "Paramètres" pour changer le nombre de mesures totales et mesures par ligne (1-10).
6. Cliquer sur une case (mesure) pour ouvrir le modal :
   - Indiquer un accord (ex: Abm7).
   - Cocher "Diviser la mesure" pour deux accords (séparer par `|`, `,`, `;` ou espace).
   - Cocher "Afficher dans un ovale" pour dessiner l'accord dans un ovale blanc à bord noir.
7. Utiliser "Dupliquer" pour copier une partie entière.
8. Utiliser "Transposer ▲" / "Transposer ▼" pour changer globalement les notes racines d'un demi-ton,
   en conservant les suffixes.
9. Exporter en PDF avec "Exporter PDF" (utilise la boîte d'impression du navigateur).

Remarques techniques
--------------------
- La transposition conserve les suffixes (ex: `Abm7` → `Am7` si on transposé d'un cran selon l'échelle).
- Racines reconnues : A ; Bb ; B ; C ; C# ; D ; Eb ; E ; F ; F# ; G ; Ab
- La division des mesures est gérée visuellement avec un fond diagonal et deux champs (haut-gauche, bas-droite).
- Taille et marges calibrées pour A4 via CSS. L'impression suit le style `@media print` et la règle `@page { size: A4 }`.

Améliorations possibles
-----------------------
- Sauvegarder / charger via localStorage ou fichier JSON.
- Export PDF plus fin (ajouter feuille par feuille si plusieurs pages) via une librairie (jsPDF, puppeteer).
- Imprimer plusieurs pages si la grille dépasse une page A4.
- Meilleure ergonomie pour l'édition (glisser/déposer, multi-édition, copier/coller de mesures).
- Validation stricte des accords et auto-suggestion (liste déroulante).

Licence
-------
Proposition / prototype.

```