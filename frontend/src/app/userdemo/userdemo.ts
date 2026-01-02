import {Component, OnInit, ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-userdemo',
  imports: [],
  templateUrl: './userdemo.html',
  styleUrl: './userdemo.css',
  standalone: true
})
export class Userdemo {
  userdata: Array<any> = []
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    fetch("http://localhost:3000/users")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network Error: " + response.status);
        }
        return response.json();
      })
      .then(userdata => {
        this.userdata = userdata;
        console.log(userdata);
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error("Fetch Error: ", error);
      });
  }
}
