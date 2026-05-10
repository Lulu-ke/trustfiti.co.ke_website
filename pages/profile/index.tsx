import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import StarRating from '@/components/reviews/StarRating';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import {
  Mail,
  Phone,
  Calendar,
  Star,
  Edit3,
  MessageSquare,
} from 'lucide-react';
import type { Review } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProfileData {
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
    phoneNumber: string;
    avatar: string | null;
    role: string;
    createdAt: string;
  };
  stats: {
    totalReviews: number;
    averageRating: number;
  };
  reviews: Review[];
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, mutate } = useSWR<ProfileData>(
    isAuthenticated ? '/api/profile' : null,
    fetcher
  );

  React.useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent('/profile')}`);
    }
  }, [isAuthenticated, authLoading, router]);

  const openEditModal = () => {
    if (data) {
      setEditName(data.user.fullName || '');
      setEditEmail(data.user.email || '');
    }
    setEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName.trim() || null,
          email: editEmail.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success('Profile updated successfully');
        setEditModalOpen(false);
        mutate();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !data) return null;

  const { user: profile, stats, reviews } = data;

  return (
    <>
      <Head>
        <title>My Profile — TrustFiti</title>
      </Head>

      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Profile Header Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar
                src={profile.avatar}
                name={profile.fullName}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {profile.fullName || 'Anonymous User'}
                  </h1>
                  <Badge variant="neutral" className="text-xs capitalize">
                    {profile.role.replace('_', ' ').toLowerCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  {profile.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {profile.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={openEditModal}>
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalReviews}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Reviews
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Avg. Rating</div>
            </div>
            <div className="hidden sm:block bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {new Date().getMonth() - new Date(profile.createdAt).getMonth() + 1}
              </div>
              <div className="text-sm text-gray-500">Months Active</div>
            </div>
          </div>

          {/* Reviews History */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              My Reviews
              <span className="text-gray-400 font-normal ml-2">
                ({reviews.length})
              </span>
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  No reviews yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  You haven&apos;t written any reviews yet.
                </p>
                <Link href="/reviews/write">
                  <Button size="sm">
                    Write your first review
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.id}`}
                    className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating value={review.rating} readonly size="sm" />
                          {review.title && (
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {review.title}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {review.company && (
                            <span className="font-medium text-gray-500">
                              {review.company.name}
                            </span>
                          )}
                          <span>·</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              loading={isSaving}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            helperText="Optional. Used for notifications."
          />
        </div>
      </Modal>
    </>
  );
}
