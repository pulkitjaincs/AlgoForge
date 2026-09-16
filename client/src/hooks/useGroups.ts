import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';

export const useMyGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getMyGroups().then(res => res.data || res)
  });
};

export const useGroupDetail = (id: string) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroup(id).then(res => res.data || res)
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => groupsApi.createGroup(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { inviteCode: string }) => groupsApi.joinGroup(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useLeaderboard = (groupId: string) => {
  return useQuery({
    queryKey: ['groups', groupId, 'leaderboard'],
    queryFn: () => groupsApi.getLeaderboard(groupId).then(res => res.data || res),
    enabled: !!groupId
  });
};
