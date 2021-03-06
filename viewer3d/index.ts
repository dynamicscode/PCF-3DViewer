import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Engine, Scene, SceneLoader, Tools, Node, AssetsManager, AbstractMesh, NegateBlock } from "babylonjs";
import 'babylonjs-loaders';
import { node } from "prop-types";

export class viewer3d implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private container: HTMLDivElement;
	private nodeContainer: HTMLDivElement;
	private canvasElement: HTMLCanvasElement;
	private engine: Engine;
	private scene: Scene;
	private data: string;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this.container = container;

		this.nodeContainer = document.createElement('div');
		this.nodeContainer.id = 'divNodeContainer';

		this.canvasElement = document.createElement('canvas');
		this.canvasElement.style.width = '100%';
		this.canvasElement.style.height = '100%';

		this.container.appendChild(this.canvasElement);
		
		this.container.appendChild(this.nodeContainer);
		
		this.engine = new Engine(this.canvasElement, true);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		const url: string = context.parameters.Url.raw as string;

		this.load3DModel(url);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}

	private createScene(data: string): Scene {
		var scene: Scene = new Scene(this.engine);
		scene.createDefaultCameraOrLight();
		scene.clearColor = new BABYLON.Color4(1,0,0,0);

		var base64_model_content = data;
		var raw_content = Tools.DecodeBase64(base64_model_content);
		var blob = new Blob([raw_content]);
		var url = URL.createObjectURL(blob);
		SceneLoader.Append("", url, scene, function () {
			scene.createDefaultCamera(true, true, true);
		}, undefined, undefined, ".glb");

		return scene;

	}

	private async load3DModel(url:string) {
		await fetch(url).then(response => response.arrayBuffer().then(
			(buffer) => {
				this.data = "data:base64," + this.arrayBufferToBase64(buffer);
			})
		);

		this.scene = this.createScene(this.data);

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});

		this.scene.onReadyObservable.add(this.seceneOnReady);
	}

	private seceneOnReady(s: Scene) {
		const root: Node = s.rootNodes.filter(n => n.name === "__root__")[0];
		if (root) {
			const children: AbstractMesh[] = root.getChildMeshes();
			var div = document.getElementById('divNodeContainer') as HTMLDivElement;
			while (div.lastChild) {
				div.removeChild(div.lastChild);
			}
			for (let i = 0; i < children.length; i++) {
				let nodeElement: HTMLInputElement = document.createElement('input');
				let lable: HTMLLabelElement = document.createElement('label');
				lable.htmlFor = children[i].id;
				lable.textContent =  children[i].id;
				
				nodeElement.id = children[i].id;
				nodeElement.style.width = "50px";
				nodeElement.value = children[i].name;
				nodeElement.checked = true;
				nodeElement.type = "checkbox";
				nodeElement.onchange = () => toggleNodeVisibility(children[i]);
				div.appendChild(nodeElement);
				div.appendChild(lable);
			}
		}
	}

	private arrayBufferToBase64(buffer: ArrayBuffer) {
		var binary = '';
		var bytes = [].slice.call(new Uint8Array(buffer));
	
		bytes.forEach((b) => binary += String.fromCharCode(b));
	
		return window.btoa(binary);
	};
}



function toggleNodeVisibility(n: AbstractMesh) {
	n.isVisible = !n.isVisible;
}