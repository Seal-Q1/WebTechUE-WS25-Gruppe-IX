import {Component, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {UserDto} from '../dtos/user.dto';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.html',
  styleUrls: ['./profile-list.css'],
})
export class ProfileList implements OnInit {

  users: UserDto[] = [];

  constructor(public userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.getUserDemo().subscribe(data => {
        this.users = this.deserializeUserData(data);
      }
    );
  }

  deserializeUserData(data: Array<object>): UserDto[] {
    return data.map((item: any): UserDto => ({
      id: item.id,
      username: item.username,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
      phone: item.phone,
    }));
  }
}
