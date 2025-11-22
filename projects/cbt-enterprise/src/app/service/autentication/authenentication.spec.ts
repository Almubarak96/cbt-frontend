import { TestBed } from '@angular/core/testing';

import { Authenentication } from './authenentication';

describe('Authenentication', () => {
  let service: Authenentication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authenentication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
