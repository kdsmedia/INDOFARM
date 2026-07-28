#!/usr/bin/env bash
# =============================================================================
# setup_assets.sh — Copy all source art assets into the Unity project tree
# Run this locally OR it is called automatically by GitHub Actions before build.
# =============================================================================
set -euo pipefail

UNITY="game/Assets/_Project"

echo "===> [1/6] UI Sprites (Buttons, Boxes, Sliders)"
cp -r BoxesBanners/.        "$UNITY/Art/UI/Sprites/Boxes/"
cp -r ButtonsIcons/.        "$UNITY/Art/UI/Sprites/Buttons/"
cp -r ButtonsText/.         "$UNITY/Art/UI/Sprites/Buttons/"
cp -r Sliders/.             "$UNITY/Art/UI/Sprites/Sliders/"

echo "===> [2/6] UI Icons"
cp -r Icons/.               "$UNITY/Art/UI/Icons/Misc/"

echo "===> [3/6] Characters — KayKit Adventurers (FBX + animations)"
SRC_KAY="KayKit_Adventurers_2.0_FREE"
cp -r "$SRC_KAY/Assets/fbx/."   "$UNITY/Art/Characters/Workers/Models/"
cp -r "$SRC_KAY/Assets/fbx/."   "$UNITY/Art/Characters/Farmer/Models/"
cp -r "$SRC_KAY/Animations/fbx/."  "$UNITY/Art/Characters/Workers/Animations/"
cp -r "$SRC_KAY/Animations/fbx/."  "$UNITY/Art/Characters/Farmer/Animations/"

echo "===> [4/6] Character Outfits (Modular Fantasy, FBX for Unity)"
SRC_OUTFITS="Modular Character Outfits - Fantasy[Standard]/Exports/FBX (Unity)"
cp -r "$SRC_OUTFITS/Modular Parts/."  "$UNITY/Art/Characters/Outfits/Peasant/"
cp -r "$SRC_OUTFITS/Outfits/."        "$UNITY/Art/Characters/Outfits/Ranger/"

echo "===> [5/6] Environment — Medieval Village (FBX + Textures)"
SRC_MED="Medieval_Village_MegaKit/Standard"
cp -r "$SRC_MED/FBX/."       "$UNITY/Art/Environment/Farm/Buildings/"
cp -r "$SRC_MED/Textures/."  "$UNITY/Art/Environment/Farm/Buildings/"

echo "===> [6/6] Environment — Stylized Nature (FBX + Textures)"
SRC_NAT="Stylized_Nature_MegaKit"
cp -r "$SRC_NAT/FBX/."       "$UNITY/Art/Environment/Nature/Trees/"
cp -r "$SRC_NAT/Textures/."  "$UNITY/Art/Environment/Nature/Trees/"

echo ""
echo "✅  All assets copied into Unity project."
echo "    Next: open game/ in Unity 2022.3 LTS (URP) to generate .meta files and prefabs."
