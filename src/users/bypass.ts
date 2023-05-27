import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BYPASS_KEY = 'bypass';
export const BypassAuth = () => {
  return SetMetadata(BYPASS_KEY, true);
};