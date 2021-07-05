import { Controller, Get, Post, Param, Query, Body, HttpCode } from '@nestjs/common';
import { Release } from 'src/models/release';
import { Owner } from 'src/services/owner';
import { Releases } from '../../services/releases';
import { Infoblocks } from '../../services/infoblocks';

import { ApiProperty, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Binary } from 'bson';

class IRelease {
  name: string
  description?: string
  tags?: string[]
}

class IReleaseFull extends IRelease {
  id: string
  authorId: string
}

class TagResponse {
  /** Внутренний ID */
  id: string
  /** Внутренний ID предка */
  parentId?: string
  /** Имя тега */
  name: string
}

class ListParams {
  authorId?: string
  tag?: string
}

@Controller('inner/releases')
export class InnerReleasesController {
  constructor(private owner:Owner, private releases:Releases, private infoblocks:Infoblocks) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить инфоблок в виде json по id' })
  @ApiOkResponse({ type: IReleaseFull })
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
  @ApiOkResponse({ type: String })
  async create(@Body() newReleaseParams: IRelease): Promise<string> {
    let newRelease = new Release()
    Object.assign(newRelease,newReleaseParams)
    let buf = newRelease.makeBlock(this.owner.privateKey)
    await this.releases.store(buf)
    return newRelease.getId();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Получить теги релизов' })
  @ApiOkResponse({ type: TagResponse, isArray: true })
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
  @ApiOkResponse({ type: String, isArray: true })
  async list(@Query() query:ListParams): Promise<string[]> {
    let binAuthor: Buffer
    if (query.authorId) {
      binAuthor = Buffer.from(query.authorId,'base64')
    }
    let result = await this.releases.list(binAuthor,query.tag)
    return result.map( id => id.buffer.toString('hex') )
  }
  

}
