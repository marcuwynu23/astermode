(function (global) {
	// Create a namespace for the library
	const DevModeLibrary = {
		devModeDiv: null,
		contextMenu: null,
		tooltip: null,
		isDragging: false,
		startX: 0,
		startY: 0,
		initialLeft: 0,
		initialTop: 0,
		hoverEnabled: false,

		enable: function () {
			// Check if 'Dev Mode' div already exists
			if (this.devModeDiv) return;

			// Create the 'Dev Mode' div
			this.devModeDiv = document.createElement("div");
			this.devModeDiv.id = "devModeIndicator";
			this.devModeDiv.textContent = "Dev Mode";

			// Apply styles to the 'Dev Mode' div
			this.devModeDiv.style.position = "fixed";
			this.devModeDiv.style.bottom = "10px";
			this.devModeDiv.style.left = "10px";
			this.devModeDiv.style.fontWeight = "bold";
			this.devModeDiv.style.fontSize = "16px";
			this.devModeDiv.style.backgroundColor = "red";
			this.devModeDiv.style.color = "white";
			this.devModeDiv.style.padding = "5px 10px";
			this.devModeDiv.style.borderRadius = "5px";
			this.devModeDiv.style.zIndex = "10000";
			this.devModeDiv.style.cursor = "pointer";

			// Make the 'Dev Mode' div draggable
			this.devModeDiv.addEventListener("mousedown", this.onMouseDown.bind(this));

			// Create the context menu div
			this.contextMenu = document.createElement("div");
			this.contextMenu.id = "devModeContextMenu";
			this.contextMenu.style.position = "absolute";
			this.contextMenu.style.display = "none";
			this.contextMenu.style.backgroundColor = "white";
			this.contextMenu.style.border = "1px solid #ccc";
			this.contextMenu.style.borderRadius = "5px";
			this.contextMenu.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
			this.contextMenu.style.zIndex = "10001";
			this.contextMenu.style.width = "150px";
			this.contextMenu.style.padding = "10px";
			this.contextMenu.style.boxSizing = "border-box";

			// Create a tooltip div to show dimensions
			this.tooltip = document.createElement("div");
			this.tooltip.id = "hoverTooltip";
			this.tooltip.style.position = "absolute";
			this.tooltip.style.backgroundColor = "red";
			this.tooltip.style.color = "white";
			this.tooltip.style.padding = "2px 5px";
			this.tooltip.style.borderRadius = "3px";
			this.tooltip.style.fontSize = "14px";
			this.tooltip.style.zIndex = "10002";
			this.tooltip.style.display = "none";
			document.body.appendChild(this.tooltip);

			// Append buttons to the context menu
			const toggleHoverEffectButton = document.createElement("button");
			toggleHoverEffectButton.textContent = "Enable Hover Border";
			toggleHoverEffectButton.style.display = "block";
			toggleHoverEffectButton.style.width = "100%";
			toggleHoverEffectButton.style.padding = "5px 0";
			toggleHoverEffectButton.style.border = "none";
			toggleHoverEffectButton.style.backgroundColor = "transparent";
			toggleHoverEffectButton.style.cursor = "pointer";
			toggleHoverEffectButton.style.textAlign = "left";

			// Add event listener to toggle hover effect
			toggleHoverEffectButton.addEventListener("click", () => {
				this.hoverEnabled = !this.hoverEnabled;
				if (this.hoverEnabled) {
					this.enableHoverEffect();
					toggleHoverEffectButton.textContent = "Disable Hover Border";
				} else {
					this.disableHoverEffect();
					toggleHoverEffectButton.textContent = "Enable Hover Border";
				}
				this.contextMenu.style.display = "none";
			});

			const clearStorageButton = document.createElement("button");
			clearStorageButton.textContent = "Clear Local Storage";
			clearStorageButton.style.display = "block";
			clearStorageButton.style.width = "100%";
			clearStorageButton.style.padding = "5px 0";
			clearStorageButton.style.border = "none";
			clearStorageButton.style.backgroundColor = "transparent";
			clearStorageButton.style.cursor = "pointer";
			clearStorageButton.style.textAlign = "left";

			clearStorageButton.addEventListener("click", () => {
				localStorage.clear();
				alert("Local storage cleared!");
				this.contextMenu.style.display = "none";
			});

			this.contextMenu.appendChild(toggleHoverEffectButton);
			this.contextMenu.appendChild(clearStorageButton);

			// Append the 'Dev Mode' div and context menu to the root element
			const root = document.getElementById("root");
			if (root) {
				root.appendChild(this.devModeDiv);
				root.appendChild(this.contextMenu);
			} else {
				console.error("Root element not found!");
				return;
			}

			// Show context menu on 'Dev Mode' div click
			this.devModeDiv.addEventListener("click", (event) => {
				event.stopPropagation();
				this.contextMenu.style.display = "block";
				const devModeRect = this.devModeDiv.getBoundingClientRect();
				this.contextMenu.style.left = `${devModeRect.left}px`;
				this.contextMenu.style.top = `${devModeRect.top - this.contextMenu.offsetHeight - 10}px`;
			});

			// Hide the context menu when clicking outside of it
			document.addEventListener("click", this.hideContextMenu.bind(this));
		},

		disable: function () {
			if (!this.devModeDiv) return; // If 'Dev Mode' is not enabled, do nothing

			// Remove elements and event listeners
			this.devModeDiv.remove();
			this.contextMenu.remove();
			this.tooltip.remove();
			document.body.removeEventListener("mouseover", this.addHoverEffect.bind(this));
			document.body.removeEventListener("mouseout", this.removeHoverEffect.bind(this));
			document.removeEventListener("mousemove", this.onMouseMove.bind(this));
			document.removeEventListener("mouseup", this.onMouseUp.bind(this));
			document.removeEventListener("click", this.hideContextMenu.bind(this));

			this.devModeDiv = null;
			this.contextMenu = null;
			this.tooltip = null;
		},

		onMouseDown: function (event) {
			this.isDragging = true;
			this.startX = event.clientX;
			this.startY = event.clientY;
			this.initialLeft = parseInt(this.devModeDiv.style.left, 10);
			this.initialTop = parseInt(this.devModeDiv.style.bottom, 10);
			document.addEventListener("mousemove", this.onMouseMove.bind(this));
			document.addEventListener("mouseup", this.onMouseUp.bind(this));
		},

		onMouseMove: function (event) {
			if (!this.isDragging) return;
			const deltaX = event.clientX - this.startX;
			const deltaY = event.clientY - this.startY;
			this.devModeDiv.style.left = `${this.initialLeft + deltaX}px`;
			this.devModeDiv.style.bottom = `${this.initialTop - deltaY}px`;
		},

		onMouseUp: function () {
			this.isDragging = false;
			document.removeEventListener("mousemove", this.onMouseMove.bind(this));
			document.removeEventListener("mouseup", this.onMouseUp.bind(this));
		},

		enableHoverEffect: function () {
			document.body.addEventListener("mouseover", this.addHoverEffect.bind(this));
			document.body.addEventListener("mouseout", this.removeHoverEffect.bind(this));
		},

		disableHoverEffect: function () {
			document.body.removeEventListener("mouseover", this.addHoverEffect.bind(this));
			document.body.removeEventListener("mouseout", this.removeHoverEffect.bind(this));
			location.reload();
		},

		addHoverEffect: function (event) {
			const target = event.target;
			target.style.outline = "4px solid red";

			// Get element dimensions
			const rect = target.getBoundingClientRect();
			const width = rect.width.toFixed(1);
			const height = rect.height.toFixed(1);
			this.tooltip.textContent = `Width: ${width}px, Height: ${height}px`;
			this.tooltip.style.display = "block";
			this.tooltip.style.left = `${rect.left + window.scrollX}px`;
			this.tooltip.style.top = `${rect.top + window.scrollY - this.tooltip.offsetHeight - 5}px`;
		},

		removeHoverEffect: function (event) {
			event.target.style.outline = "";
			this.tooltip.style.display = "none";
		},

		hideContextMenu: function () {
			if (this.contextMenu) {
				this.contextMenu.style.display = "none";
			}
		},
	};

	// Function to observe DOM changes and inject the indicator
	function observeDOM() {
		const observer = new MutationObserver((mutations, observerInstance) => {
			const root = document.getElementById("root");
			if (root) {
				console.log(import.meta.env);
				if (import.meta.env.VITE_APP_MODE === "development") {
					DevModeLibrary.enable(); // Enable Dev Mode initially if in development
				} else if (import.meta.env.REACT_APP_MODE === "development") {
					DevModeLibrary.enable(); // Enable Dev Mode initially if in development
				} else {
					DevModeLibrary.disable(); // Disable Dev Mode if not in development
				}
				observerInstance.disconnect(); // Stop observing after initialization
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}

	// Ensure the function is called after DOM content is fully loaded
	document.addEventListener("DOMContentLoaded", observeDOM);

	// Expose the library to the global object
	global.DevMode = DevModeLibrary;
})(window);

// DevMode.enable();
