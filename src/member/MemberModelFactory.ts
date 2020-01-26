import { Member, toMemberId } from "./Member";
import { toGroupId } from "../group/Group";

/**
 * Create a Member model from a MemberJsonView
 */
export class MemberModelFactory {

  /**
   * Create a new member with the default values for reward and carbon saving
   */
  public createFromPartial(view: PartialMemberJsonView): Member {
    return {
      id: null,
      member_group_id: toGroupId(view.group),
      rewards: 0,
      carbon_saving: 0,
      default_transport_mode: view.defaultTransportMode,
      default_distance: view.defaultDistance,
      smartcard: view.smartcard || null
    };
  }

  public createFromMinimum(view: MinimumMemberJsonView) {
    return {
      id: toMemberId(view.id),
      default_transport_mode: view.defaultTransportMode,
      default_distance: view.defaultDistance
    };
  }
}

export interface PartialMemberJsonView {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  smartcard?: string
}

export interface MinimumMemberJsonView {
  id: string,
  defaultTransportMode: string,
  defaultDistance: number
}
