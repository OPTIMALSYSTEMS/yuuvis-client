import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@yuuvis/core';

@Component({
  selector: 'yuv-enter',
  templateUrl: './enter.component.html',
  styleUrls: ['./enter.component.scss']
})
export class EnterComponent implements OnInit {
  private returnUrl: string;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

  reload() {
    // this.router.navigate(['/']);
    this.authService.fetchUser().subscribe(user => {
      this.router.navigateByUrl(this.returnUrl || '/');
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl || '/');
    }
  }
}
