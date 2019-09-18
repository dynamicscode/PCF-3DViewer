import * as React from 'react'

export interface IProps {
    callback:() => Promise<void>;
}


export default class BabylonViewer extends React.Component<IProps, {}> {
    constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdn.babylonjs.com/babylon.js';
        const headScript: HTMLScriptElement = document.getElementsByTagName('script')[0];
        (headScript.parentNode as any).insertBefore(script, headScript);
        script.addEventListener('load', () => {
            let scriptTag2: HTMLScriptElement = document.createElement('script');
            scriptTag2.type = 'text/javascript';
            scriptTag2.src = 'https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js';
            const headScript: HTMLScriptElement = document.getElementsByTagName('script')[0];
            (headScript.parentNode as any).insertBefore(scriptTag2, headScript);
            scriptTag2.addEventListener('load', () => {
                setTimeout(this.props.callback, 5000);
            });
        })
    }

    render() {
        return <div style={{ height: `50vh` }} />
    }
}