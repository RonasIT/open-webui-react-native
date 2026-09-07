import { Expose } from 'class-transformer';

export class GetGroupsRequest {
  // NOTE: `share=true` narrows the list to the groups a non-admin is allowed to share with; for an
  // admin the backend ignores it and answers with every group.
  @Expose()
  public share?: boolean;

  constructor(request: Partial<GetGroupsRequest> = {}) {
    Object.assign(this, request);
  }
}
