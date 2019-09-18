import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { Engine, Scene, SceneLoader } from "babylonjs";
import 'babylonjs-loaders';
import ReactDOM = require("react-dom");
import React = require("react");
import BabylonViewer, { IProps } from "./babylonviewer";

export class viewer3d implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private container: HTMLDivElement;
	private iFrame: HTMLIFrameElement;
	private context: ComponentFramework.Context<IInputs>
	private canvasElement: HTMLCanvasElement;
	private engine: Engine;
	private data: string;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
// require('//cdn.babylonjs.com/babylon.js');
// require('//preview.babylonjs.com/loaders/babylonjs.loaders.min.js');

		this.context = context;
		this.container = container;

		this.canvasElement = document.createElement('canvas');
		this.container.appendChild(this.canvasElement);
		this.engine = new Engine(this.canvasElement, true);

		this.load3DModel();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// let props: IProps = {} as IProps;
		// props.callback = this.load3DModel.bind(this);
		// ReactDOM.render(React.createElement(BabylonViewer, props)
		// , this.container);
		
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	private createScene(data: string): Scene {
		var scene: Scene = new Scene(this.engine);
		scene.createDefaultCameraOrLight();
	
		var raw_content = BABYLON.Tools.DecodeBase64(data);
		var blob = new Blob([raw_content]);
		var url = URL.createObjectURL(blob);
		SceneLoader.Append("", url, scene, function () { 
			scene.createDefaultCamera(true, true, true);
		}, undefined, undefined, ".glb");
		
		return scene;
	}

	private async load3DModel() {
		const url: string = 'https://srv-file6.gofile.io/download/48dxb8/hololens.glb';
		await fetch(url).then(response => response.arrayBuffer().then(
			(buffer) => {
				this.data = 'data:base64,' + arrayBufferToBase64(buffer);
			})
		);

		this.engine.runRenderLoop(() => {
			this.createScene(this.data).render();
		}); 
	}
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
	var binary = '';
	var bytes = [].slice.call(new Uint8Array(buffer));
  
	bytes.forEach((b) => binary += String.fromCharCode(b));
  
	return window.btoa(binary);
  };