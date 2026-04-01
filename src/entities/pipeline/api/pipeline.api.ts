import type { AxiosPromise } from 'axios'
import { apiInstance } from '@/shared/api/local'
import type { ListResponse, PipelineQuery } from '../model/pipeline.types'
import type { PipelineSectionDto } from './pipeline.dto.types'

export const getPipelineSections = (
  params: PipelineQuery = {}
): AxiosPromise<ListResponse<PipelineSectionDto>> => {
  return apiInstance.get('/pipeline-sections', { params })
}

export const getPipelineSectionById = (id: number): AxiosPromise<PipelineSectionDto> => {
  return apiInstance.get(`/pipeline-sections/${id}`)
}
