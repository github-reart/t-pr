import React from 'react';
import packageJson from '../../package.json';

const Content: React.FC = () => {
  const version = packageJson.version;

  return (
    <>
      <h2>Мониторинг PR</h2>
      <p>Информационная активность РЦСК в г. Владимир</p>
      <p>Версия: {version}</p>
    </>
  );
};

export default Content;
