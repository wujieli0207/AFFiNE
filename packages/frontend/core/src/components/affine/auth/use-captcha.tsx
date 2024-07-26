import { apis } from '@affine/electron-api';
import { Turnstile } from '@marsidev/react-turnstile';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';

import * as style from './style.css';

type Challenge = {
  challenge: string;
  resource: string;
};

const challengeFetcher = async (url: string) => {
  if (!environment.isDesktop) {
    return undefined;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch challenge');
  }
  const challenge = (await res.json()) as Challenge;
  if (!challenge || !challenge.challenge || !challenge.resource) {
    throw new Error('Invalid challenge');
  }

  return challenge;
};
const generateChallengeResponse = async (challenge: string) => {
  if (!environment.isDesktop) {
    return undefined;
  }

  return await apis?.ui?.getChallengeResponse(challenge);
};

const captchaAtom = atom<string | undefined>(undefined);
const responseAtom = atom<string | undefined>(undefined);

const Captcha = () => {
  const setCaptcha = useSetAtom(captchaAtom);
  const [response] = useAtom(responseAtom);

  if (!runtimeConfig.enableCaptcha) {
    return null;
  }

  if (environment.isDesktop) {
    if (response) {
      return <div className={style.captchaWrapper}>Making Challenge</div>;
    } else {
      return <div className={style.captchaWrapper}>Verified Client</div>;
    }
  }

  return (
    <Turnstile
      className={style.captchaWrapper}
      siteKey={process.env.CAPTCHA_SITE_KEY || '1x00000000000000000000AA'}
      onSuccess={setCaptcha}
    />
  );
};

export const useCaptcha = (): [string | undefined, string?] => {
  return ['success'];
};
