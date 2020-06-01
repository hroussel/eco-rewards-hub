import { JourneyFactory } from "../JourneyFactory";
import { indexBy } from "ts-array-utils";
import { Member } from "../../member/Member";
import { GenericRepository } from "../../database/GenericRepository";
import { MemberModelFactory } from "../../member/MemberModelFactory";
import { Context } from "koa";
import { Journey } from "../Journey";
import { MultiPartFormReader } from "./MultiPartFormReader";
import sharp = require("sharp");
import ReadableStream = NodeJS.ReadableStream;
import autobind from "autobind-decorator";

@autobind
export class JourneyController {

  constructor(
    private readonly memberRepository: GenericRepository<Member>,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly formReader: MultiPartFormReader,
    private readonly storage: RemoteFileStorage
  ) { }

  /**
   * Multi-part form handler for POST /journey requests. Allows users to create a journey and upload an image to S3
   */
  public async post(input: any, ctx: Context): Promise<PostJourneyResponse> {
    const factory = await this.getJourneyFactory();
    const form = await this.formReader.getForm(ctx.req) as PostJourneyRequest;
    const errors = this.validateForm(form);

    if (errors.length > 0) {
      return { code: 400, data: { errors } };
    }

    const journey = await factory.create([form.memberId!, form.date!, form.mode, form.distance], 1);
    const savedJourney = await this.journeyRepository.save(journey);

    if (form.image) {
      const resize = sharp().resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 90 });

      await this.storage({
        Bucket: "eco-rewards-images",
        Key: savedJourney.id + ".jpg",
        Body: form.image.pipe(resize),
      });
    }

    return { code: 201, data: "success" };
  }

  private async getJourneyFactory(): Promise<JourneyFactory> {
    const members = await this.memberRepository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});

    return new JourneyFactory(members, membersBySmartcard, this.memberRepository, new MemberModelFactory());
  }

  private validateForm(form: PostJourneyRequest) {
    const errors: string[] = [];

    if (!form.memberId) {
      errors.push("Member ID must be set");
    }
    if (!form.date || form.date.match(/\d{4}-\d{2}-\d{2}/) === null) {
      errors.push("Travel date must be set");
    }
    if (!form.mode) {
      errors.push("Travel mode must be set");
    }
    if (!form.distance) {
      errors.push("Travel distance must be set");
    }

    return errors;
  }
}

export interface PostJourneyResponse {
  code: 201 | 400,
  data: "success" | {
    errors: string[]
  }
}

interface PostJourneyRequest {
  memberId?: string,
  date?: string,
  mode?: string,
  distance?: number
  image?: ReadableStream
}

export type RemoteFileStorage = (opts: {
  Bucket: string,
  Key: string,
  Body: ReadableStream
}) => Promise<any>;
