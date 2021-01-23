enum nameType {
  firstName,
  lastName,
  midName,
  suffix
}

interface Name {
  type: nameType;
  text: string;
  ssml: string;
  language: string;
  audio: string;
  option: Object;
}

interface UserForm {
  username: string;
  names: Name[];
  password: string;
}

interface UserModel {
  names: Name[];
  password: string;
}


