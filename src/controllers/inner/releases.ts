import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { Release } from 'src/models/release';
import { Owner } from 'src/services/owner';
import { Releases } from '../../services/releases';
import { Infoblocks } from '../../services/infoblocks';

import { ApiProperty, ApiOperation } from '@nestjs/swagger';
import { Binary } from 'bson';

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

class ListParams {
  @ApiProperty({ required: false })
  authorId?: string
  @ApiProperty({ required: false })
  tag?: string
}

@Controller('inner/releases')
export class InnerReleasesController {
  constructor(private owner:Owner, private releases:Releases, private infoblocks:Infoblocks) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить инфоблок в виде json по id' })
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

  @Post('create')
  @ApiOperation({ summary: 'Создать новый блок из json' })
  async create(@Body() newReleaseParams: IRelease): Promise<string> {
    let newRelease = new Release()
    Object.assign(newRelease,newReleaseParams)
    let buf = newRelease.makeBlock(this.owner.privateKey)
    await this.releases.store(buf)
    return newRelease.getId();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Получить теги релизов' })
  async getTags(): Promise<TagResponse[]> {
    let tags = await this.releases.getTags()
    return tags.map(t => ({
      id: t._id.toHexString(),
      name: t.name,
      parentId: t.parentId?t.parentId.toHexString():null,
      count: t.count
    }))
  }

  @Get('list')
  @ApiOperation({ summary: 'Получить список id по параметрам' })
  async list(@Query() query:ListParams): Promise<string[]> {
    let binAuthor: Buffer
    if (query.authorId) {
      binAuthor = Buffer.from(query.authorId,'base64')
    }
    let result = await this.releases.list(binAuthor,query.tag)
    return result.map( id => id.buffer.toString('hex') )
  }
  

}
