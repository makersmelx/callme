import { protos } from '@google-cloud/text-to-speech';

enum NameType {
  firstName,
  lastName,
  midName,
  suffix
}

export interface Name {
  type: NameType;
  text: string;
  ssml: string;
  ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender;
  language: string;
  audio: string;
}

export interface UserForm {
  username: string;
  names: Name[];
  password: string;
  option: Object;
}

export interface UserModel {
  names: Name[];
  password: string;
  option: Object;
}

//


