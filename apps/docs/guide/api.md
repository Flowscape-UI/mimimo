# Mimimo capabilities

Every page includes a live example, method details and Vanilla, React and Vue tabs. Start with creating a companion, then add the capabilities you need.

### [Create a companion](../api/create-pet)

Create one instance per mounted component or page. Pass a character pack, a local container and the size you want. The returned Pet is the handle for every later interaction.

### [Your own character](../api/define-pet)

Define reusable artwork separately from the live instance. A definition contains an id, display name, dimensions and named animations. You can share it between many pets without making core depend on your character pack.

### [Register media states](../api/add-state)

An animation state describes artwork, not a framework component. Register states at creation or add them later. Reusing a name replaces its media; the first state starts automatically when the pet has no current state.

### [Play a base state](../api/play)

Use play for an ongoing mode such as idle, sleep or thinking. Unlike a temporary reaction, it changes the base state. Try sleep and idle below and watch the state readout.

### [React to interactions](../api/reactions)

Use a reaction for a short celebration without losing the base mode. react takes a state name; addReaction maps a browser action to a state. Click React, or enable the click mapping and touch the pet itself.

### [Messages and bubbles](../api/say)

Show a greeting, a hint or a celebration. A string creates a simple message. An object adds a title and description. Edit the text below, say it, then compare dismissing a message with disabling the whole bubble.

### [Position and anchors](../api/position)

Choose exact coordinates for a free-moving pet or an anchor for a pet that follows a corner when the available area changes. Coordinates are relative to the active environment, not always the document.

### [Resize a companion](../api/size)

Change the rendered dimensions without recreating the companion or replacing its artwork. Use this for compact widgets and larger onboarding scenes. Try both sizes below.

### [Dragging](../api/draggable)

Let visitors pick up the character or pin it inside a scene. Switching draggable does not change its state or visibility. Drag the preview, disable dragging and try again.

### [Prepare media](../api/preload)

Prepare an animation before you need to show it. Await preload before starting a carefully timed onboarding or celebration. Omitting names prepares all registered states; use a subset for large packs.

### [Pause and resume](../api/playback)

Pause playback without removing the character. Resume returns control to the normal playback rules. A static image will look the same; use the animated Mochi preview to see the difference.

### [Hide and show](../api/visibility)

Hide a companion temporarily without rebuilding it. This is useful when a visitor needs a quiet interface or when your application enters a focused task. Show restores the same instance.

### [Listen to events](../api/events)

Connect the companion to your application through typed events. on returns an unsubscribe function. Click the pet, unsubscribe, and click again to see the difference in the event output.

### [Custom controls](../api/panels)

Mount your own toolbar below the character. Mimimo hosts a real DOM element; your application owns its behavior. Use textContent for labels and clean up your own listeners.

### [Send a message](../api/chat)

Connect a reply handler through chat.onMessage when creating the pet. sendMessage calls that handler and shows the returned text. The preview is a local echo, with no AI or network request.

### [Clean up an instance](../api/destroy)

Call destroy when the owner unmounts. It removes the character and its panels, stops rendering, releases gestures and aborts owned asynchronous work. It is safe to call more than once.
