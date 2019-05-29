import { Component, OnInit } from "@angular/core";

import { Staff } from "../staff";
import { StaffService } from "../staff.service";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-staff",
  templateUrl: "./staff.component.html",
  styleUrls: ["./staff.component.css"]
})
export class StaffComponent implements OnInit {
  staff: Staff[];
  newStaff: Object = {};

  constructor(private staffService: StaffService, private _store: Store<any>) {
    _store.select("users").subscribe(users => {
      this.staff = users;
    });
  }

  ngOnInit() {
    if (this.staff.length == 0) {
      this.getstaff();
    }
  }

  getstaff(): void {
    this.staffService.getAllStaff().subscribe(staff => console.log(staff));
  }

  add(): void {
    this.staffService.addStaff(this.newStaff as Staff).subscribe(staff => {
      console.log(staff);
    });
  }

  delete(staff: Staff): void {
    let isConfirmed = confirm(`Are you sure you want to delete ${staff.name}`);
    if (isConfirmed) {
      this.staffService.deleteStaff(staff).subscribe();
    }
  }
}
