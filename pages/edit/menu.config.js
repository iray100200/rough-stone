import CodeIcon from '@material-ui/icons/Code'
import SettingsIcon from '@material-ui/icons/Settings'

const fileMenu = [
  {
    name: '新文件',
    shortcut: 'Ctrl + N'
  },
  {
    type: 'divider'
  },
  {
    name: '保存',
    shortcut: 'Ctrl + S'
  },
  {
    name: '另存为',
    shortcut: 'Ctrl + Shift + S'
  },
  {
    name: '保存全部',
    shortcut: 'Ctrl + K S'
  },
  {
    type: 'divider'
  },
  {
    name: '退出'
  }
]

const editMenu = [
  {
    name: '撤销',
    shortcut: 'Ctrl + Z'
  },
  {
    name: '取消撤销',
    shortcut: 'Ctrl + Y'
  },
  {
    type: 'divider'
  },
  {
    name: '剪切',
    shortcut: 'Ctrl + X'
  },
  {
    name: '复制',
    shortcut: 'Ctrl + C'
  },
  {
    name: '粘贴',
    shortcut: 'Ctrl + V'
  },
  {
    type: 'divider'
  },
  {
    name: '查找',
    shortcut: 'Ctrl + F'
  },
  {
    name: '替换',
    shortcut: 'Ctrl + H'
  },
  {
    type: 'divider'
  },
  {
    name: '切换行注释',
    shortcut: 'Ctrl + /'
  },
  {
    name: '切换块注释',
    shortcut: 'Shift + Alt + A'
  }
]

const selectionMenu = [
  {
    name: '全选',
    shortcut: 'Ctrl + A'
  },
  {
    name: '向右选中',
    shortcut: 'Shift + Alt + ➡'
  },
  {
    name: '向左选中',
    shortcut: 'Shift + Alt + ⬅'
  },
  {
    type: 'divider'
  },
  {
    name: '向上复制行',
    shortcut: 'Shift + Alt + ⬆'
  },
  {
    name: '向下复制行',
    shortcut: 'Shift + Alt + ⬇'
  },
  {
    name: '向上移动行',
    shortcut: 'Alt + ⬆'
  },
  {
    name: '向下移动行',
    shortcut: 'Alt + ⬇'
  },
  {
    type: 'divider'
  },
  {
    name: 'Add Cursor Above',
    shortcut: 'Ctrl + Alt + ⬆'
  },
  {
    name: 'Add Cursor Below',
    shortcut: 'Ctrl + Alt + ⬇'
  },
  {
    name: 'Add Cursor To Line Ends',
    shortcut: 'Shift + Alt + I'
  },
  {
    name: 'Add Next Occurrence',
    shortcut: 'Ctrl + D'
  },
  {
    name: 'Add Previous Occurrence'
  },
  {
    name: 'Select All Occurrence',
    shortcut: 'Ctrl + Shift + L'
  }
]

const runMenu = [
  {
    name: '运行',
    shortcut: 'Ctrl+F5'
  }
]

const config = {
  sideMenus: [
    {
      icon: CodeIcon,
      title: '浏览代码'
    },
    {
      icon: SettingsIcon,
      title: '设置'
    }
  ],
  menus: [
    {
      name: '文件',
      menuList: fileMenu
    },
    {
      name: '编辑',
      menuList: editMenu
    },
    {
      name: '选中',
      menuList: selectionMenu
    },
    {
      name: '视图',
      menuList: fileMenu
    },
    {
      name: '运行',
      menuList: runMenu
    }
  ]
}

export default config