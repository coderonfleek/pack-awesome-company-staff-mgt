import { InMemoryDbService } from "angular-in-memory-web-api";
import { Staff } from "./staff";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const staff = [
      { id: 11, name: "Mr. Nice" },
      { id: 12, name: "Narco" },
      { id: 13, name: "Bombasto" },
      { id: 14, name: "Celeritas" },
      { id: 15, name: "Magneta" },
      { id: 16, name: "RubberMan" },
      { id: 17, name: "Dynama" },
      { id: 18, name: "Dr IQ" },
      { id: 19, name: "Magma" },
      { id: 20, name: "Tornado" }
    ];
    return { staff };
  }

  // Overrides the genId method to ensure that a staff always has an id.
  // If the staff array is empty,
  // the method below returns the initial number (11).
  // if the staff array is not empty, the method below returns the highest
  // staff id + 1.
  genId(staff: Staff[]): number {
    return staff.length > 0
      ? Math.max(...staff.map(staff => staff.id)) + 1
      : 11;
  }
}
