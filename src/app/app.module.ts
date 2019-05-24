import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { StoreModule } from "@ngrx/store";
import users from "./store/reducer";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { StaffDetailComponent } from "./staff-detail/staff-detail.component";
import { StaffComponent } from "./staff/staff.component";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({ users })
  ],
  declarations: [AppComponent, StaffComponent, StaffDetailComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
