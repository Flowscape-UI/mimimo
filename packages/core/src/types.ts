interface TimelineOptions {
  /** Playback multiplier. 1 is normal speed. */
  readonly speed?: number;
  readonly loop?: boolean;
}
export interface FramesState extends TimelineOptions {
  readonly type?: 'frames';
  readonly frames: readonly string[];
  readonly fps: number;
}
export interface SpriteState extends TimelineOptions {
  readonly type: 'sprite';
  readonly path: string;
  readonly columns: number;
  readonly rows: number;
  readonly frameCount: number;
  readonly startFrame?: number;
  readonly fps: number;
}
export interface VideoState extends TimelineOptions {
  readonly type: 'video';
  readonly path: string;
  readonly poster?: string;
}
export interface ImageState {
  readonly type?: 'image';
  readonly path: string;
}
/** GIF timing and repetition come from the file, not from Mimimo. */
export interface GifState {
  readonly type: 'gif';
  readonly path: string;
  /** Still image shown instead of the GIF when reduced motion is requested. */
  readonly poster?: string;
}
export type PetState =
  FramesState | SpriteState | VideoState | ImageState | GifState;
/** Backwards-compatible name for the original frame sequence. */
export type PetAnimation = FramesState;
export interface PetDefinition {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly animations: Readonly<Record<string, PetState>>;
  readonly initialState?: string;
}
export interface ChatContext {
  readonly signal: AbortSignal;
}
export interface ChatOptions {
  onMessage: (message: string, context: ChatContext) => Promise<string>;
  placeholder?: string;
  errorMessage?: string;
}
export type PetAction = 'hover' | 'click' | 'drag';
export type PetReactions = Readonly<Partial<Record<PetAction, string>>>;
export interface PetPosition {
  x: number;
  y: number;
}
export type PetAnchor =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export interface PreloadOptions {
  signal?: AbortSignal;
  timeout?: number;
}
export interface PetMessage {
  readonly title: string;
  readonly description?: string;
}
export interface BubbleOptions {
  /** Disabled bubbles retain messages without displaying them. Default: true. */
  enabled?: boolean;
  /** Show the built-in dismiss button. Default: false. */
  closeButton?: boolean;
}
export interface PetOptions {
  bubble?: boolean | BubbleOptions;
  /** Caller-owned content mounted below the character. */
  panel?: HTMLElement;
  character?: PetDefinition;
  id?: string;
  name?: string;
  width?: number;
  height?: number;
  states?: Readonly<Record<string, PetState>>;
  initialState?: string;
  /** Local environment: clips artwork and panels to this element's client area. */
  container?: HTMLElement;
  draggable?: boolean;
  position?: PetPosition;
  /** Default: container when supplied, otherwise viewport. Viewport ignores container. */
  bounds?: 'viewport' | 'container';
  anchor?: PetAnchor;
  offset?: PetPosition;
  chat?: ChatOptions;
  reactions?: PetReactions;
}
export interface PetEvents {
  loading: { states: readonly string[] };
  ready: { states: readonly string[] };
  loaderror: { states: readonly string[]; error: Error };
  animationend: { state: string };
  resize: { width: number; height: number };
  messagestart: { message: string };
  messageend: { message: string; reply: string };
  messageerror: { message: string; error: Error };
  click: undefined;
  dragstart: { x: number; y: number };
  dragend: { x: number; y: number; cancelled: boolean };
  statechange: { state: string };
  move: { x: number; y: number };
  mediaerror: { state: string; error: Error };
}
export interface Pet {
  readonly element: HTMLElement;
  /** Empty until the first state is registered. */
  readonly state: string;
  readonly position: Readonly<PetPosition>;
  readonly paused: boolean;
  readonly draggable: boolean;
  setPosition(position: PetPosition): void;
  setSize(width: number, height: number): void;
  setDraggable(enabled: boolean): void;
  setAnchor(anchor: PetAnchor, offset?: PetPosition): void;
  removeState(name: string): boolean;
  hasState(name: string): boolean;
  /** Returns a snapshot of registered names. */
  getStates(): readonly string[];
  setDefaultState(name: string): void;
  preload(names?: readonly string[], options?: PreloadOptions): Promise<void>;
  pause(): void;
  resume(): void;
  sendMessage(message: string): Promise<string>;
  cancelMessage(): void;
  /** Adds or replaces a state. The first state starts automatically. */
  addState(name: string, options: PetState): Pet;
  /** Adds or replaces a reaction. State names can be registered later. */
  addReaction(action: PetAction, state: string): Pet;
  removeReaction(action: PetAction): Pet;
  /** Temporarily plays a state directly. Returns false if that state is missing. */
  react(name: string): boolean;
  stopReaction(): void;
  play(state: string): void;
  say(message: string | PetMessage): void;
  setBubbleEnabled(enabled: boolean): void;
  dismissBubble(): void;
  /** Replaces the lower panel. null restores the built-in chat, if configured. */
  setPanel(content: HTMLElement | null): void;
  /** Caller owns the button's click handler; use dismissBubble() or hide(). */
  setBubbleClose(content: HTMLElement | null): void;
  show(): void;
  hide(): void;
  on<K extends keyof PetEvents>(
    event: K,
    listener: (detail: PetEvents[K]) => void,
  ): () => void;
  destroy(): void;
}
