import { Component, ViewChild } from '@angular/core';
import {
  DiagramComponent,
  IConnectionChangeEventArgs,
  IExportOptions,
  ITextEditEventArgs,
  PrintAndExport,
} from '@syncfusion/ej2-angular-diagrams';
import {
  Diagram,
  NodeModel,
  UndoRedo,
  ConnectorModel,
  PointPortModel,
  Connector,
  FlowShapeModel,
  SymbolInfo,
  IDragEnterEventArgs,
  SnapSettingsModel,
  MarginModel,
  TextStyleModel,
  StrokeStyleModel,
  OrthogonalSegmentModel,
  PaletteModel,
} from '@syncfusion/ej2-diagrams';
import { ExpandMode } from '@syncfusion/ej2-navigations';
import { paletteIconClick } from './diagrams/diagram-common';
import { Action, Data, PipeModel } from './diagrams/diagram-interface ';
Diagram.Inject(UndoRedo);
Diagram.Inject(PrintAndExport);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'UMLdiagram';
  @ViewChild('diagram')
  public diagram: DiagramComponent;
  public dataObj: Data = {
    title: 'Json Data',
    pipes: [],
    actions: [],
  };

  public ExportDiagram(): void {
    let exportOptions: IExportOptions = {};
    exportOptions.format = 'JPG';
    exportOptions.mode = 'Download';
    exportOptions.region = 'PageSettings';
    exportOptions.multiplePage = false;
    this.diagram.exportDiagram(exportOptions);
  }

  public getNodeDefaults(node: NodeModel): NodeModel {
    node.height = 100;
    node.width = 100;
    node.style.fill = '#6BA5D7';
    node.style.strokeColor = 'White';
    return node;
  }
  constructor() {}

  public terminator: FlowShapeModel = { type: 'Flow', shape: 'Terminator' };
  public process: FlowShapeModel = { type: 'Flow', shape: 'Process' };
  public decision: FlowShapeModel = { type: 'Flow', shape: 'Decision' };
  public data: FlowShapeModel = { type: 'Flow', shape: 'Data' };
  public directdata: FlowShapeModel = { type: 'Flow', shape: 'DirectData' };

  public margin: MarginModel = { left: 25, right: 25 };
  public connAnnotStyle: TextStyleModel = { fill: 'white' };
  public strokeStyle: StrokeStyleModel = { strokeDashArray: '2,2' };

  public segments: OrthogonalSegmentModel = [
    { type: 'Orthogonal', direction: 'Top', length: 120 },
  ];
  public segments1: OrthogonalSegmentModel = [
    { type: 'Orthogonal', direction: 'Right', length: 100 },
  ];

  public nodeDefaults(node: NodeModel): NodeModel {
    let obj: NodeModel = {};
    if (obj.width === undefined) {
      obj.width = 145;
    } else {
      let ratio: number = 100 / obj.width;
      obj.width = 100;
      obj.height *= ratio;
    }
    obj.style = { fill: '#357BD2', strokeColor: 'white' };
    obj.annotations = [{ style: { color: 'white', fill: 'transparent' } }];
    obj.ports = getPorts(node);
    return obj;
  }
  public connDefaults(obj: Connector): void {
    if (obj.id.indexOf('connector') !== -1) {
      obj.type = 'Orthogonal';
      obj.targetDecorator = { shape: 'Arrow', width: 10, height: 10 };
      console.log('conn::', obj);
    }
  }
  public created(): void {
    this.diagram.fitToPage();
  }
  public interval: number[] = [
    1, 9, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25,
    9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75,
  ];

  public snapSettings: SnapSettingsModel = {
    horizontalGridlines: { lineColor: '#e0e0e0', lineIntervals: this.interval },
    verticalGridlines: { lineColor: '#e0e0e0', lineIntervals: this.interval },
  };

  public dragEnter(args: IDragEnterEventArgs): void {
    // console.log('Drag Enter called', args);
    let obj: NodeModel = args.element as NodeModel;
    if (obj && obj.width && obj.height) {
      let oWidth: number = obj.width;
      let oHeight: number = obj.height;
      let ratio: number = 100 / obj.width;
      obj.width = 100;
      obj.height *= ratio;
      obj.offsetX += (obj.width - oWidth) / 2;
      obj.offsetY += (obj.height - oHeight) / 2;
      obj.style = { fill: '#357BD2', strokeColor: 'white' };
      let action: Action = {
        id: obj.id,
        offsetX: obj.offsetX,
        offsetY: obj.offsetY,
      };

      this.dataObj.actions = [...this.dataObj.actions, action];
      console.log('(drag event) dataObj:', this.dataObj);
    }
  }

  public textEdit(args: ITextEditEventArgs): void {
    let actions = this.dataObj.actions;
    let pipes = this.dataObj.pipes;
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].id == args.element.id) {
        actions[i].title = args.newValue;
        break;
      }
    }
    for (let i = 0; i < pipes.length; i++) {
      if (pipes[i].id == args.element.id) {
        pipes[i].pipeName = args.newValue;
        break;
      }
    }
    console.log('dataObj:', this.dataObj);
  }

  public connectionChange(args: IConnectionChangeEventArgs): void {
    if (args.state === 'Changed') {
      console.log(args);

      if (args.connector.targetID && args.connector.sourceID) {
        if (this.dataObj.pipes.length > 0) {
          for (let i = 0; i < this.dataObj.pipes.length; i++) {
            if (this.dataObj.pipes[i].id == args.connector.id) {
              this.dataObj.pipes[i].from = {
                action: args.connector.sourceID,
                outputPort: args.connector.sourcePortID,
              };
              this.dataObj.pipes[i].to = {
                action: args.connector.targetID,
                inputPort: args.connector.targetPortID,
              };
              console.log(this.dataObj.pipes[i].from, this.dataObj.pipes[i].to);
              return;
            }
          }
        }

        let pipeData: PipeModel = {
          id: args.connector.id,
          from: {
            action: args.connector.sourceID,
            outputPort: args.connector.sourcePortID,
          },
          to: {
            action: args.connector.targetID,
            inputPort: args.connector.targetPortID,
          },
        };
        this.dataObj.pipes = [...this.dataObj.pipes, pipeData];
        console.log('dataObj:', this.dataObj);
      }
    }
  }

  //SymbolPalette Properties
  public symbolMargin: MarginModel = {
    left: 15,
    right: 15,
    top: 15,
    bottom: 15,
  };
  public expandMode: ExpandMode = 'Multiple';
  //Initialize the flowshapes for the symbol palatte
  private flowshapes: NodeModel[] = [
    { id: 'Terminator', shape: { type: 'Flow', shape: 'Terminator' } },
    { id: 'Process', shape: { type: 'Flow', shape: 'Process' } },
    { id: 'Decision', shape: { type: 'Flow', shape: 'Decision' } },
    { id: 'Document', shape: { type: 'Flow', shape: 'Document' } },
    {
      id: 'PreDefinedProcess',
      shape: { type: 'Flow', shape: 'PreDefinedProcess' },
    },
    { id: 'PaperTap', shape: { type: 'Flow', shape: 'PaperTap' } },
    { id: 'DirectData', shape: { type: 'Flow', shape: 'DirectData' } },
    { id: 'SequentialData', shape: { type: 'Flow', shape: 'SequentialData' } },
    { id: 'Sort', shape: { type: 'Flow', shape: 'Sort' } },
    { id: 'MultiDocument', shape: { type: 'Flow', shape: 'MultiDocument' } },
    { id: 'Collate', shape: { type: 'Flow', shape: 'Collate' } },
    {
      id: 'SummingJunction',
      shape: { type: 'Flow', shape: 'SummingJunction' },
    },
    { id: 'Or', shape: { type: 'Flow', shape: 'Or' } },
    {
      id: 'InternalStorage',
      shape: { type: 'Flow', shape: 'InternalStorage' },
    },
    { id: 'Extract', shape: { type: 'Flow', shape: 'Extract' } },
    {
      id: 'ManualOperation',
      shape: { type: 'Flow', shape: 'ManualOperation' },
    },
    { id: 'Merge', shape: { type: 'Flow', shape: 'Merge' } },
    {
      id: 'OffPageReference',
      shape: { type: 'Flow', shape: 'OffPageReference' },
    },
    {
      id: 'SequentialAccessStorage',
      shape: { type: 'Flow', shape: 'SequentialAccessStorage' },
    },
    { id: 'Annotation', shape: { type: 'Flow', shape: 'Annotation' } },
    { id: 'Annotation2', shape: { type: 'Flow', shape: 'Annotation2' } },
    { id: 'Data', shape: { type: 'Flow', shape: 'Data' } },
    { id: 'Card', shape: { type: 'Flow', shape: 'Card' } },
    { id: 'Delay', shape: { type: 'Flow', shape: 'Delay' } },
  ];

  //Initializes connector symbols for the symbol palette
  private connectorSymbols: ConnectorModel[] = [
    {
      id: 'Link1',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      targetDecorator: {
        shape: 'Arrow',
        style: { strokeColor: '#757575', fill: '#757575' },
      },
      style: { strokeWidth: 1, strokeColor: '#757575' },
    },
    {
      id: 'link3',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' },
    },
    {
      id: 'Link21',
      type: 'Straight',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      targetDecorator: {
        shape: 'Arrow',
        style: { strokeColor: '#757575', fill: '#757575' },
      },
      style: { strokeWidth: 1, strokeColor: '#757575' },
    },
    {
      id: 'link23',
      type: 'Straight',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' },
    },
    {
      id: 'link33',
      type: 'Bezier',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' },
    },
  ];

  public palettes: PaletteModel[] = [
    {
      id: 'flow',
      expanded: true,
      symbols: this.flowshapes,
      iconCss: 'shapes',
      title: 'Flow Shapes',
    },
    {
      id: 'connectors',
      expanded: true,
      symbols: this.connectorSymbols,
      iconCss: 'shapes',
      title: 'Connectors',
    },
  ];

  public getSymbolInfo(symbol: NodeModel): SymbolInfo {
    return { fit: true };
  }

  public getSymbolDefaults(symbol: NodeModel): void {
    symbol.style.strokeColor = '#757575';
    if (symbol.id === 'Terminator' || symbol.id === 'Process') {
      symbol.width = 80;
      symbol.height = 40;
    } else if (
      symbol.id === 'Decision' ||
      symbol.id === 'Document' ||
      symbol.id === 'PreDefinedProcess' ||
      symbol.id === 'PaperTap' ||
      symbol.id === 'DirectData' ||
      symbol.id === 'MultiDocument' ||
      symbol.id === 'Data'
    ) {
      symbol.width = 50;
      symbol.height = 40;
    } else {
      symbol.width = 50;
      symbol.height = 50;
    }
  }
  // public options: IExportOptions;

  public diagramCreate(args: Object): void {
    paletteIconClick();
  }
}

function getPorts(obj: NodeModel): PointPortModel[] {
  let ports: PointPortModel[] = [
    { id: 'port1', shape: 'Circle', offset: { x: 0, y: 0.5 } },
    { id: 'port2', shape: 'Circle', offset: { x: 0.5, y: 1 } },
    { id: 'port3', shape: 'Circle', offset: { x: 1, y: 0.5 } },
    { id: 'port4', shape: 'Circle', offset: { x: 0.5, y: 0 } },
  ];
  return ports;
}
