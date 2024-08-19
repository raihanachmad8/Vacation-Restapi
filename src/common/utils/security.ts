import { createHash } from 'crypto';

export const hashLink = async (data: string): Promise<string> => {
  return await createHash('sha256').update(data).digest('hex');
};

export const validateHashLink = async (
  data: string,
  hashed: string,
): Promise<boolean> => {
  const hash = await hashLink(data);
  return hash === hashed;
};
