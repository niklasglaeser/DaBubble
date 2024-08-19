import { TestBed } from '@angular/core/testing';

import { ChannelStateService } from './channel-state.service';

describe('ChannelStateService', () => {
  let service: ChannelStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
