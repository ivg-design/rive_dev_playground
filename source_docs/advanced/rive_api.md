# Rive Instance Methods Reference

This document provides a comprehensive guide to all methods available on a Rive instance, including public and private methods, with usage examples and context.

## Table of Contents
- [Creating a Rive Instance](#creating-a-rive-instance)
- [Animation Control Methods](#animation-control-methods)
- [State Machine Methods](#state-machine-methods)
- [ViewModels and ViewModelInstance Methods](#viewmodels-and-viewmodelinstance-methods)
- [Text and Input Methods](#text-and-input-methods)
- [Layout and Rendering Methods](#layout-and-rendering-methods)
- [Event Management Methods](#event-management-methods)
- [Property Getters and Setters](#property-getters-and-setters)
- [Cleanup Methods](#cleanup-methods)
- [Private Methods](#private-methods)

## Creating a Rive Instance

### Constructor
```typescript
constructor(params: RiveParameters)
```
Creates a new Rive instance.

**Example:**
```javascript
const rive = new Rive({
  canvas: document.getElementById('canvas'),
  src: 'animation.riv',
  autoplay: true,
  stateMachines: 'State Machine 1',
  layout: new Layout({
    fit: Fit.Cover,
    alignment: Alignment.Center
  })
});
```

### Static Constructor (Deprecated)
```typescript
static new(params: RiveParameters): Rive
```
Alternative constructor - **deprecated**, use `new Rive()` instead.

## Animation Control Methods

### play()
```typescript
public play(animationNames?: string | string[], autoplay?: true): void
```
Plays specified animations. If none specified, it unpauses everything.

**Example:**
```javascript
// Play a single animation
rive.play('idle');

// Play multiple animations
rive.play(['idle', 'walk']);

// Resume all paused animations
rive.play();
```

### pause()
```typescript
public pause(animationNames?: string | string[]): void
```
Pauses specified animations. If none specified, pauses all.

**Example:**
```javascript
// Pause specific animation
rive.pause('walk');

// Pause all animations
rive.pause();
```

### scrub()
```typescript
public scrub(animationNames?: string | string[], value?: number): void
```
Scrubs animations to a specific time value.

**Example:**
```javascript
// Scrub animation to 2.5 seconds
rive.scrub('walk', 2.5);
```

### stop()
```typescript
public stop(animationNames?: string | string[] | undefined): void
```
Stops specified animations. If none specified, stops them all.

**Example:**
```javascript
// Stop specific animation
rive.stop('walk');

// Stop all animations
rive.stop();
```

### reset()
```typescript
public reset(params?: RiveResetParameters): void
```
Resets the animation with optional new parameters.

**Example:**
```javascript
rive.reset({
  artboard: 'Character',
  animations: ['idle'],
  autoplay: true
});
```

### load()
```typescript
public load(params: RiveLoadParameters): void
```
Loads a new Rive file, keeping listeners in place.

**Example:**
```javascript
rive.load({
  src: 'new-animation.riv',
  autoplay: true,
  stateMachines: 'State Machine 1'
});
```

## State Machine Methods

### stateMachineInputs()
```typescript
public stateMachineInputs(name: string): StateMachineInput[]
```
Returns the inputs for the specified instanced state machine.

**Example:**
```javascript
const inputs = rive.stateMachineInputs('State Machine 1');
inputs.forEach(input => {
  console.log(input.name, input.type);
});
```

### setBooleanStateAtPath()
```typescript
public setBooleanStateAtPath(inputName: string, value: boolean, path: string)
```
Sets a boolean input value at a specific path in nested artboards.

**Example:**
```javascript
// Set boolean state in nested artboard
rive.setBooleanStateAtPath('isActive', true, 'nested/artboard/path');
```

### setNumberStateAtPath()
```typescript
public setNumberStateAtPath(inputName: string, value: number, path: string)
```
Sets a number input value at a specific path.

**Example:**
```javascript
// Set number state in nested artboard
rive.setNumberStateAtPath('speed', 50, 'character/movement');
```

### fireStateAtPath()
```typescript
public fireStateAtPath(inputName: string, path: string)
```
Fires a trigger input at a specific path.

**Example:**
```javascript
// Fire trigger in nested artboard
rive.fireStateAtPath('jump', 'character/actions');
```

## ViewModels and ViewModelInstance Methods

### viewModelByName()
```typescript
public viewModelByName(name: string): ViewModel | null
```
Gets a view model by its name from the Rive file.

**Example:**
```javascript
const viewModel = rive.viewModelByName('PlayerData');
if (viewModel) {
  console.log('Found view model:', viewModel.name);
  console.log('Instance count:', viewModel.instanceCount);
}
```

### viewModelByIndex()
```typescript
public viewModelByIndex(index: number): ViewModel | null
```
Gets a view model by its index in the file.

**Example:**
```javascript
const viewModel = rive.viewModelByIndex(0);
if (viewModel) {
  const instance = viewModel.defaultInstance();
}
```

### defaultViewModel()
```typescript
public defaultViewModel(): ViewModel | null
```
Returns the default view model for the current artboard.

**Example:**
```javascript
const defaultVM = rive.defaultViewModel();
if (defaultVM) {
  const instance = defaultVM.instance();
  // Work with the instance
}
```

### bindViewModelInstance()
```typescript
public bindViewModelInstance(viewModelInstance: ViewModelInstance | null)
```
Binds a view model instance to the artboard and state machines.

**Example:**
```javascript
const viewModel = rive.viewModelByName('GameData');
const instance = viewModel?.defaultInstance();
if (instance) {
  rive.bindViewModelInstance(instance);
  
  // Now you can manipulate the instance
  instance.number('score')?.value = 100;
  instance.string('playerName')?.value = 'Player 1';
}
```

### enums()
```typescript
public enums(): DataEnum[]
```
Returns all data enums defined in the Rive file.

**Example:**
```javascript
const enums = rive.enums();
enums.forEach(dataEnum => {
  console.log('Enum:', dataEnum.name);
  console.log('Values:', dataEnum.values);
});
```

## ViewModel Class Methods

When you retrieve a ViewModel from the Rive instance:

### instanceByName()
```typescript
public instanceByName(name: string): ViewModelInstance | null
```
Gets a specific instance of the view model by name.

**Example:**
```javascript
const viewModel = rive.viewModelByName('PlayerData');
const instance = viewModel?.instanceByName('Player1');
```

### instanceByIndex()
```typescript
public instanceByIndex(index: number): ViewModelInstance | null
```
Gets an instance by its index.

### defaultInstance()
```typescript
public defaultInstance(): ViewModelInstance | null
```
Gets the default instance of the view model.

### instance()
```typescript
public instance(): ViewModelInstance | null
```
Creates a new instance of the view model.

## ViewModelInstance Methods

When working with a ViewModelInstance:

### Property Access Methods

#### number()
```typescript
public number(path: string): ViewModelInstanceNumber | null
```
Access a number property at the given path.

**Example:**
```javascript
const instance = viewModel.defaultInstance();
const scoreProperty = instance?.number('player/score');
if (scoreProperty) {
  scoreProperty.value = 150;
  console.log('Score:', scoreProperty.value);
}
```

#### string()
```typescript
public string(path: string): ViewModelInstanceString | null
```
Access a string property.

**Example:**
```javascript
const nameProperty = instance?.string('player/name');
if (nameProperty) {
  nameProperty.value = 'John Doe';
}
```

#### boolean()
```typescript
public boolean(path: string): ViewModelInstanceBoolean | null
```
Access a boolean property.

**Example:**
```javascript
const isActiveProperty = instance?.boolean('player/isActive');
if (isActiveProperty) {
  isActiveProperty.value = true;
}
```

#### color()
```typescript
public color(path: string): ViewModelInstanceColor | null
```
Access a color property.

**Example:**
```javascript
const colorProperty = instance?.color('theme/primaryColor');
if (colorProperty) {
  colorProperty.rgb(255, 0, 0); // Set to red
  colorProperty.opacity(0.8); // Set opacity
}
```

#### trigger()
```typescript
public trigger(path: string): ViewModelInstanceTrigger | null
```
Access a trigger property.

**Example:**
```javascript
const triggerProperty = instance?.trigger('actions/reset');
triggerProperty?.trigger(); // Fire the trigger
```

#### enum()
```typescript
public enum(path: string): ViewModelInstanceEnum | null
```
Access an enum property.

**Example:**
```javascript
const stateProperty = instance?.enum('player/state');
if (stateProperty) {
  console.log('Available states:', stateProperty.values);
  stateProperty.value = 'running';
  // Or by index
  stateProperty.valueIndex = 1;
}
```

#### list()
```typescript
public list(path: string): ViewModelInstanceList | null
```
Access a list property.

**Example:**
```javascript
const itemsList = instance?.list('inventory/items');
if (itemsList) {
  console.log('List length:', itemsList.length);
  
  // Add a new instance
  const newItem = viewModel.instance();
  itemsList.addInstance(newItem);
  
  // Remove at index
  itemsList.removeInstanceAt(0);
  
  // Swap items
  itemsList.swap(0, 1);
}
```

#### image()
```typescript
public image(path: string): ViewModelInstanceAssetImage | null
```
Access an image property.

**Example:**
```javascript
const imageProperty = instance?.image('avatar/picture');
if (imageProperty) {
  // Decode and set a new image
  const imageBytes = await fetch('avatar.png').then(r => r.arrayBuffer());
  const decodedImage = await decodeImage(new Uint8Array(imageBytes));
  imageProperty.value = decodedImage;
}
```

### viewModel()
```typescript
public viewModel(path: string): ViewModelInstance | null
```
Access a nested view model instance.

**Example:**
```javascript
const nestedInstance = instance?.viewModel('player/stats');
if (nestedInstance) {
  nestedInstance.number('health')?.value = 100;
}
```

### replaceViewModel()
```typescript
public replaceViewModel(path: string, value: ViewModelInstance): boolean
```
Replace a nested view model with another instance.

**Example:**
```javascript
const newStatsInstance = statsViewModel.instance();
const success = instance.replaceViewModel('player/stats', newStatsInstance);
```

## Text and Input Methods

### getTextRunValue()
```typescript
public getTextRunValue(textRunName: string): string | undefined
```
Gets the text value from a text run node.

**Example:**
```javascript
const titleText = rive.getTextRunValue('titleText');
console.log('Title:', titleText);
```

### setTextRunValue()
```typescript
public setTextRunValue(textRunName: string, textRunValue: string): void
```
Sets the text value for a text run node.

**Example:**
```javascript
rive.setTextRunValue('titleText', 'Welcome to the Game!');
```

### getTextRunValueAtPath()
```typescript
public getTextRunValueAtPath(textName: string, path: string): string | undefined
```
Gets text from nested artboards.

**Example:**
```javascript
const text = rive.getTextRunValueAtPath('label', 'ui/header');
```

### setTextRunValueAtPath()
```typescript
public setTextRunValueAtPath(textName: string, value: string, path: string)
```
Sets text in nested artboards.

**Example:**
```javascript
rive.setTextRunValueAtPath('score', '1000', 'ui/hud/scoreDisplay');
```

## Layout and Rendering Methods

### drawFrame()
```typescript
public drawFrame()
```
Manually draws the current artboard frame.

**Example:**
```javascript
// Useful when you need to update the canvas immediately
rive.drawFrame();
```

### resizeToCanvas()
```typescript
public resizeToCanvas()
```
Sets the layout bounds to the current canvas size.

**Example:**
```javascript
// After canvas resize
rive.resizeToCanvas();
```

### resizeDrawingSurfaceToCanvas()
```typescript
public resizeDrawingSurfaceToCanvas(customDevicePixelRatio?: number)
```
Accounts for devicePixelRatio when rendering.

**Example:**
```javascript
// Resize with default device pixel ratio
rive.resizeDrawingSurfaceToCanvas();

// Or with custom ratio
rive.resizeDrawingSurfaceToCanvas(2);
```

### setupRiveListeners()
```typescript
public setupRiveListeners(riveListenerOptions?: SetupRiveListenersOptions): void
```
Sets up touch/mouse listeners for state machine interactions.

**Example:**
```javascript
rive.setupRiveListeners({
  isTouchScrollEnabled: true // Allow scrolling on touch devices
});
```

### removeRiveListeners()
```typescript
public removeRiveListeners(): void
```
Removes all Rive listeners from the canvas.

### startRendering()
```typescript
public startRendering()
```
Starts the rendering loop if previously stopped.

### stopRendering()
```typescript
public stopRendering()
```
Stops the rendering loop without changing animation state.

**Example:**
```javascript
// Stop rendering when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    rive.stopRendering();
  } else {
    rive.startRendering();
  }
});
```

### enableFPSCounter()
```typescript
public enableFPSCounter(fpsCallback?: FPSCallback)
```
Enables FPS reporting.

**Example:**
```javascript
// Show default FPS counter
rive.enableFPSCounter();

// Or with custom callback
rive.enableFPSCounter((fps) => {
  console.log('Current FPS:', fps);
});
```

### disableFPSCounter()
```typescript
public disableFPSCounter()
```
Disables FPS reporting.

## Event Management Methods

### on()
```typescript
public on(type: EventType, callback: EventCallback)
```
Subscribe to Rive-generated events.

**Example:**
```javascript
rive.on(EventType.Load, () => {
  console.log('Rive loaded!');
});

rive.on(EventType.StateChange, (event) => {
  console.log('States changed:', event.data);
});

rive.on(EventType.RiveEvent, (event) => {
  console.log('Rive event:', event.data);
});
```

### off()
```typescript
public off(type: EventType, callback: EventCallback)
```
Unsubscribe from events.

**Example:**
```javascript
const handler = (event) => console.log(event);
rive.on(EventType.Loop, handler);
// Later...
rive.off(EventType.Loop, handler);
```

### removeAllRiveEventListeners()
```typescript
public removeAllRiveEventListeners(type?: EventType)
```
Remove all listeners of a specific type or all listeners.

**Example:**
```javascript
// Remove all loop listeners
rive.removeAllRiveEventListeners(EventType.Loop);

// Remove all listeners
rive.removeAllRiveEventListeners();
```

## Property Getters and Setters

### Animation Properties

#### isPlaying
```typescript
public get isPlaying(): boolean
```
Returns true if any animation is playing.

#### isPaused
```typescript
public get isPaused(): boolean
```
Returns true if all animations are paused.

#### isStopped
```typescript
public get isStopped(): boolean
```
Returns true if no animations are playing or paused.

#### playingAnimationNames
```typescript
public get playingAnimationNames(): string[]
```
Returns names of currently playing animations.

#### playingStateMachineNames
```typescript
public get playingStateMachineNames(): string[]
```
Returns names of currently playing state machines.

### Artboard Properties

#### activeArtboard
```typescript
public get activeArtboard(): string
```
Returns the name of the active artboard.

#### bounds
```typescript
public get bounds(): Bounds
```
Returns the bounds of the current artboard.

#### artboardWidth / artboardHeight
```typescript
public get artboardWidth(): number
public set artboardWidth(value: number)
public get artboardHeight(): number
public set artboardHeight(value: number)
```
Get/set artboard dimensions.

**Example:**
```javascript
// Resize artboard
rive.artboardWidth = 800;
rive.artboardHeight = 600;
```

### File Properties

#### source
```typescript
public get source(): string
```
Returns the animation source URL.

#### contents
```typescript
public get contents(): RiveFileContents
```
Returns the contents of the Rive file.

**Example:**
```javascript
const contents = rive.contents;
contents?.artboards.forEach(artboard => {
  console.log('Artboard:', artboard.name);
  console.log('Animations:', artboard.animations);
  console.log('State Machines:', artboard.stateMachines);
});
```

#### animationNames
```typescript
public get animationNames(): string[]
```
Returns all animation names in the current artboard.

#### stateMachineNames
```typescript
public get stateMachineNames(): string[]
```
Returns all state machine names in the current artboard.

### Audio/Video Properties

#### volume
```typescript
public get volume(): number
public set volume(value: number)
```
Get/set the artboard volume (0-1).

**Example:**
```javascript
rive.volume = 0.5; // Set to 50% volume
```

### Layout Properties

#### layout
```typescript
public get layout(): Layout
public set layout(layout: Layout)
```
Get/set the layout configuration.

**Example:**
```javascript
rive.layout = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.Center
});
```

### Performance Properties

#### fps
```typescript
public get fps(): number
```
Returns current frames per second.

#### frameTime
```typescript
public get frameTime(): string
```
Returns average frame time in milliseconds.

## Cleanup Methods

### cleanup()
```typescript
public cleanup()
```
Cleans up all WASM-generated objects. Call this when done with the Rive instance.

**Example:**
```javascript
// Clean up when component unmounts
rive.cleanup();
```

### deleteRiveRenderer()
```typescript
public deleteRiveRenderer()
```
Cleans up only the renderer object.

### cleanupInstances()
```typescript
public cleanupInstances()
```
Cleans up artboard, animation, and state machine instances.

### resetArtboardSize()
```typescript
public resetArtboardSize()
```
Resets the artboard to its original dimensions.

## Private Methods

These methods are used internally but documented for completeness:

### init()
```typescript
private init(params: RiveLoadParameters): void
```
Initializes the Rive object from constructor or load().

### initData()
```typescript
private async initData(...): Promise<boolean>
```
Initializes runtime with Rive data.

### initArtboard()
```typescript
private initArtboard(...): void
```
Initializes artboard for playback.

### draw()
```typescript
private draw(time: number, onSecond?: VoidCallback): void
```
Main rendering loop method.

### alignRenderer()
```typescript
private alignRenderer(): void
```
Aligns the renderer with current layout settings.

### onSystemAudioChanged()
```typescript
private onSystemAudioChanged()
```
Handles audio context availability changes.

### onCanvasResize()
```typescript
private onCanvasResize(hasZeroSize: boolean)
```
Handles canvas resize events.

## Best Practices

1. **Always clean up**: Call `cleanup()` when done with a Rive instance
2. **Handle events**: Use event listeners for load, error, and state changes
3. **Check for null**: Many methods return null if the resource isn't found
4. **Use paths for nested content**: Use forward slashes for nested artboard paths
5. **Batch operations**: When making multiple changes, they'll be applied in the next render frame

**Example of proper usage:**
```javascript
const rive = new Rive({
  canvas: document.getElementById('canvas'),
  src: 'animation.riv',
  autoplay: false,
  onLoad: () => {
    // Setup after load
    const vm = rive.defaultViewModel();
    const instance = vm?.defaultInstance();
    if (instance) {
      rive.bindViewModelInstance(instance);
      
      // Set initial values
      instance.string('playerName')?.value = 'Player 1';
      instance.number('score')?.value = 0;
    }
    
    // Start playing
    rive.play('idle');
  },
  onLoadError: (e) => {
    console.error('Failed to load:', e);
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  rive.cleanup();
});
```

## Animation Class

The `Animation` class manages the state and behavior of a single animation instance. This is typically managed internally by Rive, but understanding it can be helpful.

### Properties

#### loopCount
```typescript
public loopCount: number
```
Tracks how many times the animation has looped.

#### instance
```typescript
public readonly instance: LinearAnimationInstance
```
The underlying WASM animation instance.

#### scrubTo
```typescript
public scrubTo: number | null
```
The time to scrub to on the next render (used internally).

#### playing
```typescript
public playing: boolean
```
Whether the animation is currently playing.

### Methods

#### name
```typescript
public get name(): string
```
Returns the animation's name.

#### time
```typescript
public get time(): number
public set time(value: number)
```
Get/set the animation's current time.

#### loopValue
```typescript
public get loopValue(): number
```
Returns the animation's loop type (0=one-shot, 1=loop, 2=ping-pong).

#### needsScrub
```typescript
public get needsScrub(): boolean
```
Indicates whether the animation needs to be scrubbed.

#### advance()
```typescript
public advance(time: number): void
```
Advances the animation by the given time.

#### apply()
```typescript
public apply(mix: number): void
```
Applies interpolated keyframe values to the artboard.

#### cleanup()
```typescript
public cleanup(): void
```
Deletes the backing WASM animation instance.

## Asset Loading Functions

### decodeAudio()
```typescript
export const decodeAudio = async (bytes: Uint8Array): Promise<rc.Audio>
```
Decodes bytes into an audio asset. Be sure to call `.unref()` on the audio once it's no longer needed.

**Example:**
```javascript
const audioBytes = await fetch('sound.mp3').then(r => r.arrayBuffer());
const audio = await decodeAudio(new Uint8Array(audioBytes));

// Use the audio with an AudioAsset
audioAsset.setAudioSource(audio);

// Clean up when done
audio.unref();
```

### decodeImage()
```typescript
export const decodeImage = async (bytes: Uint8Array): Promise<rc.Image>
```
Decodes bytes into an image. Be sure to call `.unref()` on the image once it's no longer needed.

**Example:**
```javascript
const imageBytes = await fetch('sprite.png').then(r => r.arrayBuffer());
const image = await decodeImage(new Uint8Array(imageBytes));

// Use the image with an ImageAsset
imageAsset.setRenderImage(image);

// Clean up when done
image.unref();
```

### decodeFont()
```typescript
export const decodeFont = async (bytes: Uint8Array): Promise<rc.Font>
```
Decodes bytes into a font. Be sure to call `.unref()` on the font once it's no longer needed.

**Example:**
```javascript
const fontBytes = await fetch('custom-font.ttf').then(r => r.arrayBuffer());
const font = await decodeFont(new Uint8Array(fontBytes));

// Use the font with a FontAsset
fontAsset.setFont(font);

// Clean up when done
font.unref();
```

## RuntimeLoader

Static class for managing the WASM runtime loading.

### Static Methods

#### getInstance()
```typescript
public static getInstance(callback: RuntimeCallback): void
```
Provides a runtime instance via a callback.

**Example:**
```javascript
RuntimeLoader.getInstance((runtime) => {
  // Use the runtime
  const renderer = runtime.makeRenderer(canvas);
});
```

#### awaitInstance()
```typescript
public static awaitInstance(): Promise<rc.RiveCanvas>
```
Provides a runtime instance via a promise.

**Example:**
```javascript
const runtime = await RuntimeLoader.awaitInstance();
const renderer = runtime.makeRenderer(canvas);
```

#### setWasmUrl()
```typescript
public static setWasmUrl(url: string): void
```
Manually sets the WASM URL before loading.

**Example:**
```javascript
// Use a custom CDN or local WASM file
RuntimeLoader.setWasmUrl('/assets/rive.wasm');
```

#### getWasmUrl()
```typescript
public static getWasmUrl(): string
```
Gets the current WASM URL.

## RiveFile Class

Manages loading and lifecycle of a Rive file.

### Constructor
```typescript
constructor(params: RiveFileParameters)
```

### Methods

#### init()
```typescript
public async init(): Promise<void>
```
Initializes the Rive file.

#### getInstance()
```typescript
public getInstance(): rc.File
```
Gets the underlying file instance (increases reference count).

#### cleanup()
```typescript
public cleanup(): void
```
Decreases reference count and cleans up if no more references.

#### on() / off()
```typescript
public on(type: EventType, callback: EventCallback): void
public off(type: EventType, callback: EventCallback): void
```
Event management for file loading.

**Example:**
```javascript
const riveFile = new RiveFile({
  src: 'animation.riv',
  onLoad: () => console.log('File loaded'),
  onLoadError: (e) => console.error('Load error:', e)
});

await riveFile.init();
```

## Layout Class

Manages how Rive content is positioned and scaled within the canvas.

### Constructor
```typescript
constructor(params?: LayoutParameters)
```

### Methods

#### copyWith()
```typescript
public copyWith(params: LayoutParameters): Layout
```
Creates a copy of the layout with modified parameters.

**Example:**
```javascript
const newLayout = currentLayout.copyWith({
  fit: Fit.Cover,
  alignment: Alignment.TopLeft
});
```

## Important Enums and Types

### Fit Enum
```typescript
export enum Fit {
  Cover = "cover",
  Contain = "contain",
  Fill = "fill",
  FitWidth = "fitWidth",
  FitHeight = "fitHeight",
  None = "none",
  ScaleDown = "scaleDown",
  Layout = "layout"
}
```

### Alignment Enum
```typescript
export enum Alignment {
  Center = "center",
  TopLeft = "topLeft",
  TopCenter = "topCenter",
  TopRight = "topRight",
  CenterLeft = "centerLeft",
  CenterRight = "centerRight",
  BottomLeft = "bottomLeft",
  BottomCenter = "bottomCenter",
  BottomRight = "bottomRight"
}
```

### EventType Enum
```typescript
export enum EventType {
  Load = "load",
  LoadError = "loaderror",
  Play = "play",
  Pause = "pause",
  Stop = "stop",
  Loop = "loop",
  Draw = "draw",
  Advance = "advance",
  StateChange = "statechange",
  RiveEvent = "riveevent",
  AudioStatusChange = "audiostatuschange"
}
```

### StateMachineInputType Enum
```typescript
export enum StateMachineInputType {
  Number = 56,
  Trigger = 58,
  Boolean = 59
}
```

### LoopType Enum
```typescript
export enum LoopType {
  OneShot = "oneshot",
  Loop = "loop",
  PingPong = "pingpong"
}
```

### RiveEventType Enum
```typescript
export enum RiveEventType {
  General = 128,
  OpenUrl = 131
}
```

## Type Definitions

### AssetLoadCallback
```typescript
export type AssetLoadCallback = (
  asset: rc.FileAsset,
  bytes: Uint8Array
) => Boolean;
```
Custom asset loader callback type.

### EventCallback
```typescript
export type EventCallback = (event: Event) => void;
```
Event handler callback type.

### FPSCallback
```typescript
export type FPSCallback = (fps: number) => void;
```
FPS reporting callback type.

## Testing Utilities

### Testing Export
```typescript
export const Testing = {
  EventManager: EventManager,
  TaskQueueManager: TaskQueueManager,
};
```
Exports for testing purposes only - not for production use.

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  rive.cleanup();
});

## Private Methods

**Important Note**: Private methods are internal implementation details and are NOT meant to be called directly by users. They are documented here for completeness and to help understand the internal workings of the Rive runtime. Attempting to access these methods directly may break your code in future versions.

### Core Initialization Methods

#### init()
```typescript
private init(params: RiveLoadParameters): void
```
Initializes the Rive object either from constructor or load(). Sets up the runtime, renderer, and starts the loading process.

**Internal Usage Example:**
```javascript
// Called internally in constructor
this.init({
  src: this.src,
  buffer: this.buffer,
  riveFile: this.riveFile,
  autoplay: params.autoplay,
  animations: params.animations,
  stateMachines: params.stateMachines,
  artboard: params.artboard,
  useOffscreenRenderer: params.useOffscreenRenderer,
});
```

#### initData()
```typescript
private async initData(
  artboardName: string,
  animationNames: string[],
  stateMachineNames: string[],
  autoplay: boolean,
  autoBind: boolean
): Promise<boolean>
```
Asynchronously initializes runtime with Rive data and prepares for playback.

**Internal Usage:**
```javascript
// Called internally during initialization
this.initData(artboard, startingAnimationNames, startingStateMachineNames, autoplay, autoBind)
  .then((hasInitialized) => {
    if (hasInitialized) {
      return this.setupRiveListeners();
    }
  });
```

#### initArtboard()
```typescript
private initArtboard(
  artboardName: string,
  animationNames: string[],
  stateMachineNames: string[],
  autoplay: boolean,
  autoBind: boolean
): void
```
Initializes the artboard and sets up animations and state machines.

#### initializeAudio()
```typescript
private initializeAudio(): void
```
Sets up audio context if the artboard has audio components.

#### initArtboardSize()
```typescript
private initArtboardSize(): void
```
Initializes artboard dimensions using preset values or defaults.

### Rendering Methods

#### draw()
```typescript
private draw(time: number, onSecond?: VoidCallback): void
```
Main rendering loop method. Advances animations, applies changes, and renders the frame.

**Internal Flow:**
```javascript
// Automatically called in the render loop
// 1. Calculate elapsed time
// 2. Advance animations and state machines
// 3. Apply changes to artboard
// 4. Clear canvas and draw
// 5. Handle events (loops, state changes)
// 6. Request next frame if playing
```

#### alignRenderer()
```typescript
private alignRenderer(): void
```
Aligns the renderer according to the current layout settings.

**Internal Usage:**
```javascript
// Called during draw() to ensure proper alignment
this.alignRenderer();
```

### Event Handling Methods

#### onSystemAudioChanged()
```typescript
private onSystemAudioChanged(): void
```
Event handler for when audio context becomes available. Updates volume settings.

#### onCanvasResize
```typescript
private onCanvasResize = (hasZeroSize: boolean) => { }
```
Arrow function that handles canvas resize events from the ResizeObserver.

**Internal Behavior:**
- Tracks when canvas has zero size
- Triggers resizing of drawing surface when canvas becomes visible
- Updates layout bounds if needed

### Data Retrieval Methods

#### retrieveTextRun()
```typescript
private retrieveTextRun(textRunName: string): rc.TextValueRun | undefined
```
Retrieves a text run node from the artboard with error handling.

**Internal Usage:**
```javascript
// Used by public getTextRunValue() method
const textRun = this.retrieveTextRun(textRunName);
return textRun ? textRun.text : undefined;
```

#### retrieveInputAtPath()
```typescript
private retrieveInputAtPath(
  name: string,
  path: string
): rc.SMIInput | undefined
```
Retrieves a state machine input at a specific path in nested artboards.

**Internal Usage:**
```javascript
// Used by public methods like setBooleanStateAtPath()
const input = this.retrieveInputAtPath(inputName, path);
if (input && input.type === StateMachineInputType.Boolean) {
  input.asBool().value = value;
}
```

#### retrieveTextAtPath()
```typescript
private retrieveTextAtPath(
  name: string,
  path: string
): rc.TextValueRun | undefined
```
Retrieves text at a specific path in nested artboards.

### Static Methods (RuntimeLoader class)

#### loadRuntime()
```typescript
private static loadRuntime(): void
```
Loads the WASM runtime, handling fallback URLs if the primary fails.

**Internal Behavior:**
1. Attempts to load from unpkg CDN
2. Falls back to jsDelivr if unpkg fails
3. Fires callbacks once loaded
4. Handles errors with detailed logging

### Internal Classes Private Methods

#### AudioManager Private Methods

##### delay()
```typescript
private async delay(time: number): Promise<void>
```
Creates a promise that resolves after specified milliseconds.

##### timeout()
```typescript
private async timeout(): Promise<void>
```
Creates a promise that rejects after 50ms for audio testing.

##### enableAudio()
```typescript
private async enableAudio(): Promise<void>
```
Enables audio once context is available.

##### testAudio()
```typescript
private async testAudio(): Promise<void>
```
Tests if audio context can be resumed.

##### _establishAudio()
```typescript
private async _establishAudio(): Promise<void>
```
Main method to establish audio, polling until available.

##### reportToListeners()
```typescript
private reportToListeners(): void
```
Notifies listeners of audio status changes.

##### listenForUserAction()
```typescript
private listenForUserAction(): void
```
Sets up click listener to enable audio on user interaction.

#### EventManager Private Methods

##### getListeners()
```typescript
private getListeners(type: EventType): EventListener[]
```
Returns all listeners of a specific event type.

#### ObjectObservers Private Methods

##### _onObservedEntry()
```typescript
private _onObservedEntry = (entry: ResizeObserverEntry) => { }
```
Handles individual resize observer entries.

##### _onObserved()
```typescript
private _onObserved = (entries: ResizeObserverEntry[]) => { }
```
Handles multiple resize observer entries.

#### RiveFile Private Methods

##### initData()
```typescript
private async initData(): Promise<void>
```
Loads Rive file data from source or buffer.

##### fireLoadError()
```typescript
private fireLoadError(message: string): void
```
Fires load error event and throws error.

### ViewModelInstance Private Methods

#### clearCallbacks()
```typescript
private clearCallbacks(): void
```
Clears all callbacks from properties.

#### propertyFromPath()
```typescript
private propertyFromPath(
  path: string,
  type: PropertyType
): ViewModelInstanceValue | null
```
Retrieves a property at a given path.

**Internal Usage:**
```javascript
// Used by public property access methods
public number(path: string): ViewModelInstanceNumber | null {
  const viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Number);
  return viewmodelInstanceValue as ViewModelInstanceNumber;
}
```

#### viewModelFromPathSegments()
```typescript
private viewModelFromPathSegments(
  pathSegments: string[],
  index: number
): ViewModelInstance | null
```
Navigates nested view models using path segments.

#### propertyFromPathSegments()
```typescript
private propertyFromPathSegments(
  pathSegments: string[],
  index: number,
  type: PropertyType
): ViewModelInstanceValue | null
```
Retrieves properties from nested paths recursively.

#### internalViewModelInstance()
```typescript
private internalViewModelInstance(name: string): ViewModelInstance | null
```
Gets or creates a view model instance with proper reference counting.

### StateMachine Private Methods

#### initInputs()
```typescript
private initInputs(runtime: rc.RiveCanvas): void
```
Fetches and caches state machine inputs.

#### mapRuntimeInput()
```typescript
private mapRuntimeInput(
  input: rc.SMIInput,
  runtime: rc.RiveCanvas
): StateMachineInput
```
Maps runtime inputs to appropriate typed wrappers.

## Understanding Private Method Access

While you cannot directly call private methods, you might need to understand them for:

1. **Debugging**: Understanding the call stack when errors occur
2. **Extending**: Creating custom classes that extend Rive functionality
3. **Contributing**: Contributing to the Rive runtime source code
4. **Performance**: Understanding the internal render loop for optimization

**Example of Understanding Internal Flow:**
```javascript
// When you call play(), internally it triggers:
// 1. taskQueue processing if not ready
// 2. animator.play() 
// 3. setupRiveListeners() if needed
// 4. startRendering() which calls draw()
// 5. draw() runs the render loop

// Understanding this helps debug issues like:
// - Why animations don't start immediately
// - How state changes are propagated
// - When listeners are attached/detached
```

**Accessing Internal State (Not Recommended):**
```javascript
// While technically possible in JavaScript, accessing private fields is discouraged:
// DON'T DO THIS - may break in future versions
const internalLayout = rive._layout; // Bad practice

// DO THIS instead - use public API
const publicLayout = rive.layout; // Good practice
```

## Best Practices

1. **Always clean up**: Call `cleanup()` when done with a Rive instance
2. **Handle events**: Use event listeners for load, error, and state changes
3. **Check for null**: Many methods return null if the resource isn't found
4. **Use paths for nested content**: Use forward slashes for nested artboard paths
5. **Batch operations**: When making multiple changes, they'll be applied in the next render frame

**Example of proper usage:**
```javascript
const rive = new Rive({
  canvas: document.getElementById('canvas'),
  src: 'animation.riv',
  autoplay: false,
  onLoad: () => {
    // Setup after load
    const vm = rive.defaultViewModel();
    const instance = vm?.defaultInstance();
    if (instance) {
      rive.bindViewModelInstance(instance);
      
      // Set initial values
      instance.string('playerName')?.value = 'Player 1';
      instance.number('score')?.value = 0;
    }
    
    // Start playing
    rive.play('idle');
  },
  onLoadError: (e) => {
    console.error('Failed to load:', e);
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  rive.cleanup();
}); 