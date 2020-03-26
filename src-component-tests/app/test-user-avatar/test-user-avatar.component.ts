import { Component, OnInit } from '@angular/core';
import { YuvUser } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-user-avatar',
  templateUrl: './test-user-avatar.component.html',
  styleUrls: ['./test-user-avatar.component.scss']
})
export class TestUserAvatarComponent implements OnInit {
  // user with image
  user1 = new YuvUser(
    {
      id: '1',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Jeff_Bridges_crop.jpg',
      firstname: 'The',
      lastname: 'Dude'
    },
    { locale: 'de' }
  );

  // user no image but first- and lastname
  user2 = new YuvUser(
    {
      id: '2',
      firstname: 'The',
      lastname: 'Dude'
    },
    { locale: 'de' }
  );

  // user no image no name
  user3 = new YuvUser(
    {
      id: '3'
    },
    { locale: 'de' }
  );

  constructor() {}

  ngOnInit() {}
}
