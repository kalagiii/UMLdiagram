export interface From {
  action: string;
  outputPort: string;
}
export interface To {
  action: string;
  inputPort: string;
}
export interface PipeModel {
  id: string;
  from: From;
  to: To;
  pipeName?: string;
}
export interface Action {
  id: any;
  offsetX: any;
  offsetY: any;
  title?: any;
}
export interface Data {
  title: string;
  pipes: PipeModel[];
  actions: Action[];
}
