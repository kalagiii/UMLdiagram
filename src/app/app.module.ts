import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DiagramModule,
  SymbolPaletteModule,
} from '@syncfusion/ej2-angular-diagrams';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { DiagramsComponent } from './diagrams/diagrams.component';
// import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DiagramModule,
    SymbolPaletteModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
