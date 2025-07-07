# Focus Area

A 3D visualization tool built with ArcGIS Maps SDK for JavaScript and Calcite Web Components, allowing users to create and customize focus areas on 3D city mesh data.

## Features

* **Focus Area Tool:** Draw custom focus areas on the map
* **Style Customization:** Switch between different focus area styles

## Screenshots

*1. Main application with no focus area*

![image](https://github.com/user-attachments/assets/c9bf214b-90c3-4cad-bdd7-2de15976af85)

*2. Focus area with Bright style*

![image](https://github.com/user-attachments/assets/aff550d4-78ba-4355-806e-128336083a73)

## Prerequisites

* Node.js
* Vite

## Project Setup

1.  **Initialize Project**

    ```bash
    # Create a new Vite project
    npm create vite@latest
    ```

    Follow the instructions on screen to initialize the project.

2.  **Install Dependencies**

    ```bash
    npm install
    ```

## Code Structure

### HTML Structure

The HTML file sets up the basic structure for the ArcGIS web application:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="initial-scale=1,maximum-scale=1,user-scalable=no"
    />
    <title>Focus Area</title>
    <link rel="stylesheet" href="./src/style.css" />
    <script type="module" src="https://js.arcgis.com/calcite-components/3.2.1/calcite.esm.js"></script>
    <link rel="stylesheet" href="https://js.arcgis.com/4.33/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.33/"></script>
    <script type="module" src="https://js.arcgis.com/4.33/map-components/"></script>
  </head>
  <body>
    <arcgis-scene item-id="d6eefc2b1e984e1eaf1c290588a52c55">
      <arcgis-zoom position="top-left"></arcgis-zoom>
      <arcgis-navigation-toggle position="top-left"></arcgis-navigation-toggle>
      <arcgis-compass position="top-left"></arcgis-compass>
      <arcgis-placement position="top-right">
        <div id="menu" class="esri-widget">
          <h3>Focus Area</h3>
          <calcite-segmented-control>
            <calcite-segmented-control-item value="bright" selected>Bright</calcite-segmented-control-item>
            <calcite-segmented-control-item value="dark">Dark</calcite-segmented-control-item>
            <calcite-segmented-control-item value="none">None</calcite-segmented-control-item>
          </calcite-segmented-control>
        </div>
      </arcgis-placement>
    </arcgis-scene>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

### CSS Styling

The CSS file provides styling for the map view and UI elements:

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#styleControl {
  text-align: center;
  position: absolute;
  bottom: 20px;
  max-width: 300px;
  margin: auto;
  left: 0;
  right: 0;
  align-items: center;
}
```

### JavaScript Implementation

1. **Module Imports**

```javascript
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
```

2. **Scene Setup**

```javascript
const sceneView = document.querySelector("arcgis-scene");
const meshLayer = new IntegratedMeshLayer({
  url: "https://tiles-eu1.arcgis.com/7cCya5lpv5CmFJHv/arcgis/rest/services/Munich_3D_Mesh_City_Mapper_2_SURE_43/SceneServer",
});

await sceneView.viewOnReady();
sceneView.map.add(meshLayer);
```

3. **Focus Area Implementation**

```javascript
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
const focusArea = new FocusArea({
  title: "Focus Area",
  id: "focus-area0",
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
```

4. **Drawing Tools**

```javascript
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
```

5. **Sketch View Model and update focus area geometry**

```javascript
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
```

## Running the Application

1. **Development Server**

   ```bash
   npm run dev
   ```

   This will start the development server at `http://localhost:5173`

2. **Build for Production**
   ```bash
   npm run build
   ```
