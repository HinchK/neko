import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import configOptions from './help.json';

export default () => {
  const environmentVariables = () => {
    let code = '';
    configOptions.forEach(option => {
      let value = ""
      if (option.defaultValue) {
        value = `"${option.defaultValue}"`
      } else if (option.type) {
        value = `<${option.type}>`
      }
      code += `# ${option.description}\n`;
      code += `NEKO_${option.key.join('_').toUpperCase()}: ${value}\n`;
    });
    return (
      <CodeBlock language="yaml">
        {code}
      </CodeBlock>
    );
  }

  const cmdArguments = () => {
    let code = '';
    configOptions.forEach(option => {
      code += `# ${option.description}\ \n`;
      code += `--${option.key.join('.')}`;
      if (option.type) {
        code += ` <${option.type}>`;
      }
      code += '\n';
    });
    return (
      <CodeBlock language="shell">
        {code}
      </CodeBlock>
    );
  }

  const yamlFile = () => {
    const final = Symbol('final');
  
    const buildYaml = (obj, prefix = '') => {
      let code = '';
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value === 'object' && !Array.isArray(value) && !value[final]) {
          code += prefix+`${key}:\n`;
          code += buildYaml(value, prefix + '  ');
        } else {
          let val = '';
          if (value.defaultValue) {
            val = `"${value.defaultValue}"`;
          } else if (value.type) {
            val = `<${value.type}>`;
          }
          code += prefix+`# ${value.description || ''}\n`;
          code += prefix+`${key}: ${val}\n`;
        }
      });
      return code;
    };

    const yamlCode = buildYaml(configOptions.reduce((acc, option) => {
      const keys = option.key;
      let current = acc;
      keys.forEach((key, index) => {
        if (!current[key]) {
          current[key] = index === keys.length - 1 ? option : {};
        }
        current = current[key];
      });
      current[final] = true;
      return acc;
    }, {}));

    return (
      <CodeBlock language="yaml">
        {yamlCode}
      </CodeBlock>
    );
  }

  return (
    <div>
      <Tabs>
        <TabItem value="env" label="Environment Variables">
          <p>You can set the following environment variables in your <code>docker-compose.yaml</code> file or in your shell environment.</p>
          {environmentVariables()}
        </TabItem>
        <TabItem value="args" label="Command Line Arguments">
          <p>You can list the following command line arguments using <code>neko serve --help</code>.</p>
          {cmdArguments()}
        </TabItem>
        <TabItem value="yaml" label="YAML Configuration File">
          <p>You can create a <code>/etc/neko/neko.yaml</code> file with the following configuration options.</p>
          {yamlFile()}
        </TabItem>
      </Tabs>
    </div>
  );
};
