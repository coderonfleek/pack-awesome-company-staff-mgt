import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { StaffComponent } from "./staff/staff.component";
import { StaffDetailComponent } from "./staff-detail/staff-detail.component";

const routes: Routes = [
  { path: "", redirectTo: "/staff", pathMatch: "full" },
  { path: "detail/:id", component: StaffDetailComponent },
  { path: "staff", component: StaffComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
