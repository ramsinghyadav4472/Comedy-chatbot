import { HStack, Button, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { FiUser, FiLogOut, FiMessageSquare } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation = ({ onLogout }: NavigationProps) => {
  const navigate = useNavigate();

  return (
    <HStack as="nav" p={4} bg="white" shadow="sm" justify="space-between" align="center" width="100%">
      <HStack spacing={4}>
        <Logo />
        <Button
          variant="ghost"
          leftIcon={<FiMessageSquare />}
          onClick={() => navigate('/chat')}
        >
          AI Chat
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiUser />}
          onClick={() => navigate('/about')}
        >
          About
        </Button>
      </HStack>
      <HStack>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User menu"
            icon={<FiUser />}
          />
          <MenuList>
            <MenuItem icon={<FiLogOut />} onClick={onLogout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </HStack>
  );
}; 