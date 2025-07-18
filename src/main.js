const [
  SketchViewModel,
  SimpleFillSymbol,
  Graphic,
  Polygon,
  Collection,
  GraphicsLayer,
  IntegratedMeshLayer,
  FocusArea,
] = await $arcgis.import([
  "@arcgis/core/widgets/Sketch/SketchViewModel.js",
  "@arcgis/core/symbols/SimpleFillSymbol.js",
  "@arcgis/core/Graphic.js",
  "@arcgis/core/geometry/Polygon.js",
  "@arcgis/core/core/Collection.js",
  "@arcgis/core/layers/GraphicsLayer.js",
  "@arcgis/core/layers/IntegratedMeshLayer.js",
  "@arcgis/core/effects/FocusArea.js",
]);

// Get the SceneView element from the DOM
const sceneView = document.querySelector("arcgis-scene");

// Create an IntegratedMeshLayer for 3D city data
// This layer will show the 3D mesh data of Munich
const meshLayer = new IntegratedMeshLayer({
  url: "https://tiles-eu1.arcgis.com/7cCya5lpv5CmFJHv/arcgis/rest/services/Munich_3D_Mesh_City_Mapper_2_SURE_43/SceneServer",
});

// Wait for the view to be ready before adding layers
await sceneView.viewOnReady();
sceneView.map.add(meshLayer);

// Define the initial focus area geometry
// This creates a polygon that will be used as the focus area
const initialFocusAreaGeometry = new Polygon({
  // Spatial reference for Web Mercator
  spatialReference: {
    latestWkid: 3857,
    wkid: 102100,
  },
  rings: [
    [
      [1288603, 6130075],
      [1288506, 6129722],
      [1288260, 6129821],
      [1288284, 6129899],
      [1288279, 6129969],
      [1288296, 6130009],
      [1288415, 6130021],
      [1288459, 6130133],
      [1288603, 6130075],
    ],
  ],
});

// Create a FocusArea instance
// This will be used to apply the focus area effect to the 3D mesh data
const focusArea = new FocusArea({
  title: "Focus Area",
  id: "focus-area0",
  outline: { color: [255, 128, 128, 0.55] },
  geometries: new Collection([initialFocusAreaGeometry]),
});

// Add the focus area to the view
sceneView.focusAreas.areas.add(focusArea);
sceneView.focusAreas.style = "bright";

// Add a segmented control to the UI to allow users to switch between different focus area styles
const styleControl = document.getElementsByTagName(
  "calcite-segmented-control"
)[0];
styleControl.addEventListener("calciteSegmentedControlChange", (event) => {
  const selectedStyleValue = event.target.selectedItem.value;
  if (selectedStyleValue === "none") {
    sceneView.focusAreas.areas.at(0).enabled = false;
  } else {
    sceneView.focusAreas.style = event.target.selectedItem.value;
    sceneView.focusAreas.areas.at(0).enabled = true;
  }
});

// Create a GraphicsLayer to display the focus area geometry
const sketchLayer = new GraphicsLayer({
  elevationInfo: {
    mode: "on-the-ground",
  },
});

// Create a Graphic to display the focus area geometry
const sketchGraphic = new Graphic({
  geometry: sceneView.focusAreas.areas.at(0).geometries.at(0),
  symbol: new SimpleFillSymbol({
    color: [255, 128, 128, 1 / 255],
  }),
});

// Add the graphic to the sketch layer
sketchLayer.graphics.add(sketchGraphic);
sceneView.map.add(sketchLayer);

// Function to update the focus area geometry
function updateFocusArea(event) {
  focusArea.geometries = new Collection([event.graphics.at(0).geometry]);
}

// Create a SketchViewModel to handle sketching
const sketchViewModel = new SketchViewModel({
  layer: sketchLayer,
  view: sceneView.view,
});

// Add an event listener to the sketch view model to update the focus area geometry
sketchViewModel.on("update", updateFocusArea);
