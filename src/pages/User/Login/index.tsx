import { Footer } from '@/components';
import {
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {Helmet, history, Link, useModel} from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, {useEffect, useState} from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import {listChartByPageUsingPost} from "@/services/skye_VDMS_api/chartController";
import {getLoginUserUsingGet, userLoginUsingPost} from "@/services/skye_VDMS_api/userController";
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
const Login: React.FC = () => {
  const [userLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();

  useEffect(()=>{
    listChartByPageUsingPost({}).then(res => {
      console.error('res',res)
    })
  })

  const fetchUserInfo = async () => {
    const userInfo = await getLoginUserUsingGet();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 登录
      const msg = await userLoginUsingPost(values);
      if (msg.code === 0) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }else {
        message.error(msg.message);
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
/*  const { status, type: loginType } = userLoginState;*/
  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
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
          actions={['其他登录方式 :', <ActionIcons key="icons" />]}*/
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
                label: '账户密码登录',
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
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码 ?
            </a>

            <Link to ="/user/register" style={{
              float: 'none',
            }}>注册</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
