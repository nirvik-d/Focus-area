# Focus Area

A 3D visualization tool built with ArcGIS Maps SDK for JavaScript and Calcite Web Components, allowing users to create and customize focus areas on 3D city mesh data.

## Features

* **Focus Area Tool:** Draw custom focus areas on the map
* **Style Customization:** Switch between different focus area styles

## Screenshots

*1. Main application with no focus area*

![image](https://github.com/user-attachments/assets/c9bf214b-90c3-4cad-bdd7-2de15976af85)

*2. Focus area with Dark style*

![image](https://github.com/user-attachments/assets/aff550d4-78ba-4355-806e-128336083a73)

## Prerequisites

* Node.js
* Vite

## Project Setup

### Initialize Project

```bash
# Create a new Vite project
npm create vite@latest
```

Follow the instructions on screen to initialize the project.

### Install Dependencies

```bash
npm install @arcgis/map-components
```

## Code Structure

### HTML Structure

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
  </head>
  <body>
    <arcgis-scene
      basemap="satellite"
      ground="world-elevation"
      camera-position="11.57879, 48.1346375, 865"
      camera-tilt="57"
      camera-heading="321"
    >
      <arcgis-zoom position="top-left"></arcgis-zoom>
      <arcgis-navigation-toggle position="top-left"></arcgis-navigation-toggle>
      <arcgis-compass position="top-left"> </arcgis-compass>
    </arcgis-scene>
    <calcite-block expanded id="styleControl" label="Focus area style">
      Focus area style
      <calcite-segmented-control>
        <calcite-segmented-control-item value="dark"
          >Dark</calcite-segmented-control-item
        >
        <calcite-segmented-control-item value="bright" checked
          >Bright</calcite-segmented-control-item
        >
        <calcite-segmented-control-item value="none"
          >None</calcite-segmented-control-item
        >
      </calcite-segmented-control>
    </calcite-block>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### CSS Styling

The CSS file provides styling for the map view and UI elements:

```css
@import "https://js.arcgis.com/calcite-components/3.2.1/calcite.css";
@import "https://js.arcgis.com/4.33/esri/themes/light/main.css";
@import "https://js.arcgis.com/4.33/map-components/main.css";

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

### TypeScript Implementation

1. **Import the required modules**

```typescript
import "./style.css";

import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-navigation-toggle";
import "@arcgis/map-components/components/arcgis-compass";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-segmented-control";
import "@esri/calcite-components/components/calcite-segmented-control-item";

import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import FocusArea from "@arcgis/core/effects/FocusArea";
import Polygon from "@arcgis/core/geometry/Polygon";
import Collection from "@arcgis/core/core/Collection";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
```

2. **Get the scene view and add the 3D mesh layer to it**

```typescript
// Get the SceneView element from the DOM
const scene: HTMLArcgisSceneElement | null = document.querySelector("arcgis-scene");
if (!scene) {
  throw new Error("Scene element not found");
}

// Create an IntegratedMeshLayer for 3D city data
// This layer will show the 3D mesh data of Munich
const meshLayer = new IntegratedMeshLayer({
  url: "https://tiles-eu1.arcgis.com/7cCya5lpv5CmFJHv/arcgis/rest/services/Munich_3D_Mesh_City_Mapper_2_SURE_43/SceneServer",
});

// Wait for the view to be ready before adding layers
await scene.viewOnReady();
if(!scene.map){
  throw new Error("Map not found");
}
scene.map.add(meshLayer);
```

3. **Define the initial focus area geometry and create a FocusArea instance. Add the focus area to the view and set the style**

```typescript
// Define the initial focus area geometry
// This creates a polygon that will be used as the focus area
const initialFocusAreaGeometry = new Polygon({
  // Spatial reference for Web Mercator
  spatialReference: {
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
scene.focusAreas.areas.add(focusArea);
scene.focusAreas.style = "bright";
```

4. **Add a segmented control to the UI to allow users to switch between different focus area styles**

```typescript
// Add a segmented control to the UI to allow users to switch between different focus area styles
const styleControl = document.getElementsByTagName(
  "calcite-segmented-control"
)[0];
styleControl.addEventListener("calciteSegmentedControlChange", (event) => {
  const selectedStyleValue = event.target.selectedItem.value;
  if (selectedStyleValue === "none") {
    const firstArea = scene.focusAreas.areas.at(0);
    if (firstArea) {
      firstArea.enabled = false;
    }
  } else {
    scene.focusAreas.style = event.target.selectedItem.value;
    const firstArea = scene.focusAreas.areas.at(0);
    if (firstArea) {
      firstArea.enabled = true;
    }
  }
});

```

5. **Create a GraphicsLayer to display the focus area geometry and add it to the scene. Add a function to update the focus area geometry for different user selected styles**

```typescript
// Create a GraphicsLayer to display the focus area geometry
const sketchLayer = new GraphicsLayer({
  elevationInfo: {
    mode: "on-the-ground",
  },
});

// Create a Graphic to display the focus area geometry
const sketchGraphic = new Graphic({
  geometry: scene.focusAreas.areas.at(0)?.geometries.at(0),
  symbol: new SimpleFillSymbol({
    color: [255, 128, 128, 1 / 255],
  }),
});

// Add the graphic to the sketch layer
sketchLayer.graphics.add(sketchGraphic);
scene.map.add(sketchLayer);

// Function to update the focus area geometry
function updateFocusArea(event: any) {
  focusArea.geometries = new Collection([event.graphics.at(0).geometry]);
}

// Create a SketchViewModel to handle sketching
const sketchViewModel = new SketchViewModel({
  layer: sketchLayer,
  view: scene.view,
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
