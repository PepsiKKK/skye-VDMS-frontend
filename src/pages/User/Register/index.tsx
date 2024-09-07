import { Footer } from '@/components';
import {
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import {Helmet, history, Link, useModel} from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, {useState} from 'react';
import Settings from '../../../../config/defaultSettings';
import {userRegisterUsingPost} from "@/services/skye_VDMS_api/userController";
const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});




const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
const Register: React.FC = () => {
  const [userLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState} = useModel('@@initialState');
  const { styles } = useStyles();

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    //校验
    const { userPassword, checkPassword } = values;
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      // 注册
      const msg = await userRegisterUsingPost(values);
      if (msg.code === 0) {
        const defaultRegisterSuccessMessage = '注册成功！';
        message.success(defaultRegisterSuccessMessage);
/*        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');*/
        const loginUrl = '/user/login';
        history.push(loginUrl);
        return;
      }else {
        message.error(msg.message);
      }
    } catch (error) {
      const defaultRegisterFailureMessage = '注册失败，请重试！';
      console.log(error);
      message.error(defaultRegisterFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;
  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'注册'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          submitter={{
            searchConfig: {
              submitText: '注册',
            }
          }}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="数据可视化管理系统"
          subTitle={'。。。VDMS是基于Vue3、Ant Design Vue、TypeScript、Vite 等前端技术栈开发的数据可视化管理系统'}
/*          initialValues={{
            autoLogin: true,
          }}
          actions={['其他注册方式 :', <ActionIcons key="icons" />]}*/
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码注册',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'用户名或密码错误'} />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请确认密码'}
                rules={[
                  {
                    required: true,
                    message: '确认密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码 ?
            </a>

            <Link to ="/user/login" style={{
              float: 'none',
            }}>已有账号，返回登录</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Register;
