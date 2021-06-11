import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Release } from 'src/models/release';
import { Owner } from 'src/services/owner';
import { Releases } from './services/releases';
import { Infoblocks } from './services/infoblocks';

import { ApiProperty } from '@nestjs/swagger';

class IRelease {
  @ApiProperty()
  name: string
  @ApiProperty()
  description?: string
  @ApiProperty()
  tags?: string[]
}

class IReleaseFull extends IRelease {
  @ApiProperty()
  id: string
  @ApiProperty()
  authorId: string
}

class TagResponse {
  @ApiProperty()
  id: string
  @ApiProperty()
  parentId?: string
  @ApiProperty()
  name: string
  @ApiProperty()
  count: number
}

@Controller('inner/releases')
export class AppController {
  //private readonly appService: AppService
  constructor(private owner:Owner, private releases:Releases, private infoblocks:Infoblocks) {}

  /** Получить инфоблок */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<IReleaseFull> {
    let buf = await this.infoblocks.get('releases',Buffer.from(id,'hex'))
    let release = new Release()
    release.deserialize( buf )
    return {
      id: release.getId(),
      authorId: release.getAuthorId(),
      name: release.name,
      description: release.description,
      tags: release.tags
    }
  }

  /** Создать инфоблок из JSON */
  @Post('create')
  async createRelease(@Body() newReleaseParams: IRelease): Promise<string> {
    let newRelease = new Release()
    Object.assign(newRelease,newReleaseParams)
    let buf = newRelease.makeBlock(this.owner.privateKey)
    await this.releases.store(buf)
    return newRelease.getId();
  }

  /** Создать инфоблок из JSON */
  @Get('tags')
  async getTags(): Promise<TagResponse[]> {
    let tags = await this.releases.getTags()
    return tags.map(t => ({
      id: t._id.toHexString(),
      name: t.name,
      parentId: t.parentId?t.parentId.toHexString():null,
      count: t.count
    }))
  }

}
